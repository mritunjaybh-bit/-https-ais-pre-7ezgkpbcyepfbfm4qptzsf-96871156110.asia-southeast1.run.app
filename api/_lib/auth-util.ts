import crypto from 'crypto';
import {
  UserAccount,
  findDbUserById,
  addDbSession,
  removeDbSession,
  clearDbSessions,
} from './db';

const activeSessions = new Set<string>();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'caphe_vietnam_secret_roastery_2026';

export function clearInMemorySessions(): void {
  activeSessions.clear();
  clearDbSessions();
}

export function generateSessionToken(user: { id: string; username: string; role: string }): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${user.id}:${user.username}:${user.role}:${timestamp}:${nonce}`;
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

export function verifySessionToken(token?: string): { valid: boolean; user?: UserAccount; error?: string } {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    const parts = token.split(':');
    // Format: userId : username : role : timestamp : nonce : sig
    if (parts.length < 5) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const sig = parts[parts.length - 1];
    const payload = parts.slice(0, parts.length - 1).join(':');

    // Verify HMAC signature
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const userId = parts[0];
    const username = parts[1];
    const role = parts[2];
    const timestampStr = parts[3];
    const timestamp = parseInt(timestampStr, 10);

    // 7-day expiration check
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || Date.now() - timestamp > SEVEN_DAYS) {
      activeSessions.delete(token);
      return { valid: false, error: 'Session expired' };
    }

    // Verify user actually exists in database and is active
    const user = findDbUserById(userId);
    if (!user) {
      activeSessions.delete(token);
      return { valid: false, error: 'User account no longer exists' };
    }

    if (user.status !== 'active') {
      activeSessions.delete(token);
      return { valid: false, error: 'User account has been deactivated' };
    }

    return { valid: true, user };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification failed' };
  }
}

export function isValidSession(token?: string): boolean {
  return verifySessionToken(token).valid;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'your registered email';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

export async function sendOtpEmail(email: string, otp: string, userName?: string): Promise<boolean> {
  try {
    const payload = {
      service_id: 'service_g3orv2b',
      template_id: 'template_yrtnzv3',
      user_id: 'ELHAjVMVjQAEVIiWB',
      template_params: {
        to_email: email,
        customer_email: email,
        email: email,
        customer_name: userName || 'Cà Phê Vietnam Team Member',
        order_id: `OTP-${otp}`,
        order_items: `Roastery Admin Password Reset Verification Code: ${otp}\n\nThis verification code is strictly valid for 10 minutes.\nIf you did not request this password reset, your account remains secure and no action is required.`,
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
