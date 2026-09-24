import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  getDbAdminConfig,
  updateDbAdminConfig,
  updateDbAdminPassword,
  hashPassword,
  verifyPassword,
} from './db';

// In-memory active session tokens
const activeSessions = new Set<string>();

// In-memory active OTP requests (ResetToken -> OTP Record)
interface OtpRecord {
  otp: string;
  email: string;
  expiresAt: number; // timestamp
}
const activeOtps = new Map<string, OtpRecord>();

export function isValidSession(token?: string): boolean {
  if (!token) return false;
  return activeSessions.has(token);
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'your registered email';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  try {
    const payload = {
      service_id: 'service_g3orv2b',
      template_id: 'template_yrtnzv3',
      user_id: 'ELHAjVMVjQAEVIiWB',
      template_params: {
        to_email: email,
        customer_email: email,
        email: email,
        customer_name: 'Cà Phê Vietnam Roastery Owner',
        order_id: `OTP-${otp}`,
        order_items: `Roastery Owner Portal Password Reset Code: ${otp}\n\nThis verification code is strictly valid for 10 minutes.\nIf you did not request this code, no action is needed.`,
        order_quantity: 1,
        order_total: `Verification Code: ${otp}`,
        order_time: new Date().toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'medium' }),
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[EmailJS] OTP email dispatched successfully to ${email}`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`[EmailJS] Server dispatch returned (${res.status}): ${errText}`);
    }
  } catch (err) {
    console.error('[EmailJS] Server dispatch error:', err);
  }
  return false;
}

export async function adminAuthHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pathParts = req.path.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1] || 'login';
  const subAction = pathParts.slice(2).join('/');

  // 1. GET /api/admin/setup-status - Check if one-time setup has completed
  if (action === 'setup-status' || subAction === 'setup-status') {
    const config = getDbAdminConfig();
    return res.status(200).json({
      isSetupComplete: Boolean(config.isSetupComplete && config.passwordHash),
      registeredEmail: config.email || 'mritunjaybh@gmail.com',
      registeredEmailMasked: maskEmail(config.email || 'mritunjaybh@gmail.com'),
      username: config.username || 'owner',
    });
  }

  // 2. POST /api/admin/setup - One-time secure account setup
  if (action === 'setup' || subAction === 'setup') {
    const config = getDbAdminConfig();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    // If already setup, require valid existing session to re-configure
    if (config.isSetupComplete && config.passwordHash && !isValidSession(token)) {
      return res.status(403).json({
        error: 'Owner account is already configured. Please log in or use Forgot Password.',
      });
    }

    const { ownerId, email, password } = req.body || {};
    const cleanId = String(ownerId || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanId || cleanId.length < 3) {
      return res.status(400).json({ error: 'Owner ID must be at least 3 characters long.' });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!cleanPass || cleanPass.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Securely hash password using scrypt
    const hashed = hashPassword(cleanPass);

    updateDbAdminConfig({
      username: cleanId,
      email: cleanEmail,
      passwordHash: hashed,
      password: undefined, // permanently purge plaintext fallback
      isSetupComplete: true,
      setupAt: new Date().toISOString(),
    });

    // Create session token immediately
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeSessions.add(sessionToken);

    return res.status(200).json({
      success: true,
      message: 'Owner account created and secured. Default credentials deactivated.',
      token: sessionToken,
      username: cleanId,
    });
  }

  // 3. POST /api/admin/forgot-password/request - Send OTP to registered email
  if (subAction === 'forgot-password/request' || action === 'request') {
    const { email } = req.body || {};
    const inputEmail = String(email || '').trim().toLowerCase();

    const config = getDbAdminConfig();
    const registeredEmail = (config.email || 'mritunjaybh@gmail.com').toLowerCase();

    if (!inputEmail) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    if (inputEmail !== registeredEmail) {
      // Small delay to prevent timing leaks
      await new Promise((r) => setTimeout(r, 400));
      return res.status(404).json({
        error: `Email address "${inputEmail}" does not match the registered roastery owner account.`,
      });
    }

    // Generate 6-digit numeric OTP and reset token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    activeOtps.set(resetToken, {
      otp,
      email: registeredEmail,
      expiresAt,
    });

    console.log(`[AdminAuth] Password reset OTP generated for ${registeredEmail}: ${otp}`);

    // Send via EmailJS in background
    sendOtpEmail(registeredEmail, otp).catch((e) => {
      console.warn('[AdminAuth] Background email send failed:', e);
    });

    return res.status(200).json({
      success: true,
      resetToken,
      emailMasked: maskEmail(registeredEmail),
      message: `A 6-digit verification code has been dispatched to ${maskEmail(registeredEmail)}. Code expires in 10 minutes.`,
      // Expose for testing if EmailJS has network restrictions in preview sandbox
      expiresInMinutes: 10,
    });
  }

  // 4. POST /api/admin/forgot-password/verify-reset - Verify OTP & update password
  if (subAction === 'forgot-password/verify-reset' || action === 'verify-reset') {
    const { resetToken, otp, newPassword } = req.body || {};

    if (!resetToken || !activeOtps.has(resetToken)) {
      return res.status(400).json({
        error: 'Invalid or expired password reset session. Please request a new OTP.',
      });
    }

    const record = activeOtps.get(resetToken)!;

    if (Date.now() > record.expiresAt) {
      activeOtps.delete(resetToken);
      return res.status(400).json({
        error: 'This verification code has expired (10-minute limit exceeded). Please request a fresh OTP.',
      });
    }

    const cleanOtp = String(otp || '').trim();
    if (cleanOtp !== record.otp) {
      return res.status(400).json({
        error: 'Invalid verification code. Please check the 6-digit code sent to your email.',
      });
    }

    const cleanPass = String(newPassword || '').trim();
    if (!cleanPass || cleanPass.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long.',
      });
    }

    // Hash and persist new password
    updateDbAdminPassword(cleanPass);
    activeOtps.delete(resetToken);

    // Create fresh session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeSessions.add(sessionToken);

    const config = getDbAdminConfig();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token: sessionToken,
      username: config.username,
    });
  }

  // 5. POST /api/admin/verify - Verify existing active session
  if (action === 'verify') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.body?.token;

    if (isValidSession(token)) {
      const config = getDbAdminConfig();
      return res.status(200).json({
        valid: true,
        username: config.username,
        email: config.email,
      });
    }
    return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
  }

  // 6. POST /api/admin/logout
  if (action === 'logout') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.body?.token;
    if (token) {
      activeSessions.delete(token);
    }
    return res.status(200).json({ success: true });
  }

  // 7. POST /api/admin/change-password (Authenticated)
  if (action === 'change-password') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.body?.token;

    if (!isValidSession(token)) {
      return res.status(401).json({ error: 'Unauthorized: Admin session required' });
    }

    const { newPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    updateDbAdminPassword(newPassword.trim());
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  }

  // 8. POST /api/admin/login
  if (action === 'login') {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both Owner ID and password.' });
    }

    const config = getDbAdminConfig();

    // If setup has never been completed, guide to setup
    if (!config.isSetupComplete || !config.passwordHash) {
      return res.status(400).json({
        requireSetup: true,
        error: 'Initial Owner Account setup is required. Please set up your credentials.',
      });
    }

    const inputUser = String(username).trim().toLowerCase();
    const inputPass = String(password).trim();

    const registeredUser = (config.username || '').toLowerCase();
    const registeredEmail = (config.email || '').toLowerCase();

    const isUserMatch = inputUser === registeredUser || inputUser === registeredEmail;
    const isPassMatch = verifyPassword(inputPass, config.passwordHash);

    if (!isUserMatch || !isPassMatch) {
      await new Promise((r) => setTimeout(r, 350));
      return res.status(401).json({ error: 'Invalid Owner ID or password.' });
    }

    // Success: Generate cryptographically random session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeSessions.add(sessionToken);

    updateDbAdminConfig({ lastLoginAt: new Date().toISOString() });

    return res.status(200).json({
      success: true,
      token: sessionToken,
      username: config.username,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
