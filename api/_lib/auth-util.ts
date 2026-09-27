import crypto from 'crypto';
import {
  getDbSessions,
  addDbSession,
  removeDbSession,
  saveDbOtp,
  getDbOtp,
  deleteDbOtp,
} from './db';

const activeSessions = new Set<string>();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'caphe_vietnam_secret_roastery_2026';

export function generateSessionToken(username: string): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${username}:${timestamp}:${nonce}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const token = `${payload}:${sig}`;
  activeSessions.add(token);
  try {
    addDbSession(token);
  } catch (e) {
    // ignore
  }
  return token;
}

export function isValidSession(token?: string): boolean {
  if (!token) return false;

  // 1. In-memory check
  if (activeSessions.has(token)) return true;

  // 2. Persistent store check
  try {
    const dbSessions = getDbSessions();
    if (dbSessions.includes(token)) {
      activeSessions.add(token);
      return true;
    }
  } catch {}

  // 3. Stateless cryptographic verification across serverless lambdas
  try {
    const parts = token.split(':');
    if (parts.length === 4) {
      const [username, timestampStr, nonce, sig] = parts;
      const timestamp = parseInt(timestampStr, 10);
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      if (!isNaN(timestamp) && Date.now() - timestamp < SEVEN_DAYS) {
        const payload = `${username}:${timestampStr}:${nonce}`;
        const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
        if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
          activeSessions.add(token);
          return true;
        }
      }
    }
  } catch {}

  return false;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'your registered email';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
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
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return false;
  }
}
