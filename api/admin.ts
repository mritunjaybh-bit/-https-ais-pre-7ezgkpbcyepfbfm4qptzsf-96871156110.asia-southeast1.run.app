import type { Request, Response } from 'express';
import crypto from 'crypto';
import {
  getDbAdminConfig,
  updateDbAdminConfig,
  getDbUsers,
  findDbUserById,
  findDbUserByIdentifier,
  createDbUser,
  updateDbUser,
  deleteDbUser,
  resetDatabaseAuth,
  hashPassword,
  verifyPassword,
  getDbProducts,
  updateDbProducts,
  getDbOrders,
  updateDbOrders,
  getDbSubscribers,
  addDbSubscriber,
  saveDbOtp,
  getDbOtp,
  deleteDbOtp,
  removeDbSession,
  findDbUserByRecovery,
  getDbSiteSettings,
  updateDbSiteSettings,
  getDbPreOrders,
  updateDbPreOrderStatus,
  getDbReviews,
  updateDbReviewStatus,
  deleteDbReview,
  getDbCircleMembers,
  type UserAccount,
} from './_lib/db.ts';
import {
  generateSessionToken,
  verifySessionToken,
  clearInMemorySessions,
  maskEmail,
  sendOtpEmail,
  sendAccountRecoveryEmail,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
} from './_lib/auth-util.ts';
import type { ProductItem } from '../src/types.ts';

function sanitizeUser(u: any) {
  if (!u) return null;
  return {
    id: u.id || 'usr-owner-default',
    username: u.username || 'owner',
    email: u.email || 'mritunjaybh@gmail.com',
    name: u.name || u.username || 'Roastery Owner',
    role: (u.role === 'staff' ? 'staff' : 'owner') as 'owner' | 'staff',
    status: (u.status === 'deactivated' ? 'deactivated' : 'active') as 'active' | 'deactivated',
    createdAt: u.createdAt || new Date().toISOString(),
    lastLoginAt: u.lastLoginAt,
  };
}

export default async function handler(req: any, res: any) {
  return adminHandler(req, res);
}

export async function adminHandler(req: Request, res: Response) {
  const origin = req.headers?.origin || '*';

  const safeJson = (statusCode: number, data: any) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', origin);
      if (origin !== '*') {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Content-Type', 'application/json');
      if (typeof res.status === 'function') {
        res.status(statusCode);
      } else {
        res.statusCode = statusCode;
      }
      if (typeof res.json === 'function') {
        return res.json(data);
      }
      return res.end(JSON.stringify(data));
    } catch (e) {
      console.error('[safeJson Error]:', e);
      try {
        res.statusCode = statusCode;
        res.end(JSON.stringify(data));
      } catch {}
    }
  };

  try {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', origin);
    if (origin !== '*') {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      return res.status ? res.status(200).end() : res.end();
    }

    // Parse Body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    req.body = body || {};

    // Extract Auth Token
    const authHeader = req.headers?.authorization || '';
    const token =
      authHeader.replace(/^Bearer\s+/i, '').trim() ||
      (req.body?.token as string) ||
      (req.query?.token as string) ||
      '';

    // Determine Action
    const pathParts = (req.path || req.url || '').split('?')[0].split('/').filter(Boolean);
    const lastSegment = pathParts[pathParts.length - 1];
    const urlAction =
      lastSegment && lastSegment !== 'admin' && lastSegment !== 'api' ? lastSegment : undefined;

    const action = (
      req.body?.action ||
      req.query?.action ||
      req.query?.subpath ||
      urlAction ||
      (req.method === 'GET' ? 'get-status-or-products' : '')
    )
      .toString()
      .toLowerCase();

    const config = getDbAdminConfig();
    const users = getDbUsers();
    const ownerUser = users.find((u) => u && (u.role === 'owner' || !u.role) && u.status !== 'deactivated');
    const isSetupDone = Boolean(config.isSetupComplete && (ownerUser || users.length > 0));

    // -------------------------------------------------------------
    // ACTION: setup-status
    // -------------------------------------------------------------
    if (action === 'setup-status' || action === 'status') {
      return safeJson(200, {
        isSetupComplete: isSetupDone,
        hasOwner: Boolean(ownerUser),
        ownerCount: users.filter((u) => u.role === 'owner').length,
        staffCount: users.filter((u) => u.role === 'staff').length,
      });
    }

    // -------------------------------------------------------------
    // ACTION: reset-setup (Wipes all accounts, clears sessions)
    // -------------------------------------------------------------
    if (action === 'reset-setup') {
      try {
        resetDatabaseAuth();
        clearInMemorySessions();
        return safeJson(200, {
          success: true,
          message: 'All admin/owner/staff accounts deleted. Database reset to fresh setup.',
          isSetupComplete: false,
        });
      } catch (resetErr: any) {
        console.error('[Admin Reset-Setup Error]:', resetErr);
        return safeJson(500, { error: 'Failed to reset setup: ' + resetErr?.message });
      }
    }

    // -------------------------------------------------------------
    // ACTION: setup (Initial One-Time Owner Account Setup)
    // -------------------------------------------------------------
    if (action === 'setup') {
      try {
        if (req.method !== 'POST') {
          return safeJson(405, { error: 'POST required for setup' });
        }

        if (isSetupDone) {
          return safeJson(400, {
            error: 'Setup has already been completed. Please log in using your Owner credentials.',
          });
        }

        const { username, email, password, name } = req.body || {};
        if (!username || !email || !password) {
          return safeJson(400, { error: 'Username, email, and password are required.' });
        }

        const cleanUser = String(username).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanPass = String(password);

        if (cleanPass.length < 6) {
          return safeJson(400, { error: 'Password must be at least 6 characters long.' });
        }

        // Check uniqueness
        if (findDbUserByIdentifier(cleanUser) || findDbUserByIdentifier(cleanEmail)) {
          return safeJson(400, { error: 'An account with that username or email already exists.' });
        }

        // Create primary Owner account
        const newOwner = createDbUser({
          username: cleanUser,
          email: cleanEmail,
          name: name ? String(name).trim() : cleanUser,
          role: 'owner',
          passwordHash: hashPassword(cleanPass),
          status: 'active',
        });

        updateDbAdminConfig({
          isSetupComplete: true,
          setupAt: new Date().toISOString(),
        });

        const sessionToken = generateSessionToken(newOwner);
        return safeJson(200, {
          success: true,
          message: 'Owner account successfully initialized.',
          token: sessionToken,
          user: sanitizeUser(newOwner),
        });
      } catch (setupErr: any) {
        console.error('[Admin Setup Error]:', setupErr);
        return safeJson(500, {
          error: `Setup initialization failed: ${setupErr?.message || 'Server error'}`,
          code: 'SETUP_SERVER_ERROR',
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION: login (Owner and Staff)
    // -------------------------------------------------------------
    if (action === 'login') {
      try {
        if (req.method !== 'POST') {
          return safeJson(405, { error: 'POST required for login' });
        }

        const { username, password } = req.body || {};
        if (!username || !password) {
          return safeJson(400, { error: 'Username/email and password are required.' });
        }

        // Rate limit check: 5 failed attempts = 15-minute lock
        const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip')
          .toString()
          .split(',')[0]
          .trim();
        const rateLimitKey = `${ip}:${String(username).toLowerCase().trim()}`;
        const rateCheck = checkLoginRateLimit(rateLimitKey);
        if (!rateCheck.allowed) {
          return safeJson(429, {
            error: `Too many failed login attempts. Account temporarily locked for ${rateCheck.remainingMinutes || 15} minutes.`,
            locked: true,
            code: 'RATE_LIMIT_LOCKED',
          });
        }

        // Check if setup is complete
        if (!isSetupDone) {
          return safeJson(403, {
            error: 'Setup is required. Please visit /setup to create the Owner account.',
            requiresSetup: true,
          });
        }

        const user = findDbUserByIdentifier(String(username));
        if (!user) {
          const failStatus = recordFailedLogin(rateLimitKey);
          if (failStatus.locked) {
            return safeJson(429, {
              error: 'Too many failed login attempts (5). Account temporarily locked for 15 minutes.',
              locked: true,
              code: 'RATE_LIMIT_LOCKED',
            });
          }
          return safeJson(401, {
            error: `Invalid credentials. Please verify your username and password. (${failStatus.remainingAttempts} attempts remaining before 15-minute lock)`,
          });
        }

        if (user.status !== 'active') {
          return safeJson(403, {
            error: 'This account has been deactivated. Please contact the Roastery Owner.',
          });
        }

        const passMatches = verifyPassword(String(password), user.passwordHash);
        if (!passMatches) {
          const failStatus = recordFailedLogin(rateLimitKey);
          if (failStatus.locked) {
            return safeJson(429, {
              error: 'Too many failed login attempts (5). Account temporarily locked for 15 minutes.',
              locked: true,
              code: 'RATE_LIMIT_LOCKED',
            });
          }
          return safeJson(401, {
            error: `Invalid credentials. Please verify your username and password. (${failStatus.remainingAttempts} attempts remaining before 15-minute lock)`,
          });
        }

        resetLoginRateLimit(rateLimitKey);
        updateDbUser(user.id, { lastLoginAt: new Date().toISOString() });
        const sessionToken = generateSessionToken(user);

        return safeJson(200, {
          success: true,
          token: sessionToken,
          user: sanitizeUser(user),
        });
      } catch (loginErr: any) {
        console.error('[Admin Login Error]:', loginErr);
        return safeJson(500, {
          error: `Authentication processing failed: ${loginErr?.message || 'Server error'}`,
          code: 'LOGIN_SERVER_ERROR',
          details: String(loginErr?.stack || loginErr),
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION: verify (Session verification)
    // -------------------------------------------------------------
    if (action === 'verify') {
      try {
        const auth = verifySessionToken(token);
        if (auth.valid && auth.user) {
          return safeJson(200, {
            valid: true,
            user: sanitizeUser(auth.user),
          });
        }
        return safeJson(401, { valid: false, error: auth.error || 'Session expired or invalid' });
      } catch (verifyErr: any) {
        console.error('[Admin Verify Error]:', verifyErr);
        return safeJson(401, { valid: false, error: 'Session verification failed' });
      }
    }

    // -------------------------------------------------------------
    // ACTION: logout
    // -------------------------------------------------------------
    if (action === 'logout') {
      try {
        if (token) {
          removeDbSession(token);
        }
        return safeJson(200, { success: true, message: 'Logged out successfully' });
      } catch (logoutErr: any) {
        console.error('[Admin Logout Error]:', logoutErr);
        return safeJson(200, { success: true, message: 'Logged out' });
      }
    }

    // -------------------------------------------------------------
    // ACTION: forgot-id / forgot-username-request (Recover Owner ID & Email)
    // -------------------------------------------------------------
    if (
      action === 'forgot-id' ||
      action === 'forgot-username-request' ||
      action === 'recover-id' ||
      action === 'forgot-username'
    ) {
      try {
        if (req.method !== 'POST') {
          return safeJson(405, { error: 'POST required' });
        }

        const { recoveryDetail, detail } = req.body || {};
        const query = String(recoveryDetail || detail || '').trim();

        if (!query) {
          return safeJson(400, {
            error: 'Please enter your registered phone number, full name, or answer a recovery prompt.',
          });
        }

        const result = findDbUserByRecovery(query);
        if (!result || !result.user) {
          return safeJson(404, {
            error:
              'No matching account found with that detail. Please verify your phone number, full name, or roastery security prompt.',
          });
        }

        const { user, matchReason } = result;

        // Send credential email asynchronously in background
        sendAccountRecoveryEmail(user.email, user.username, user.name).catch((emailErr) => {
          console.error('[Recovery Email Send Error]:', emailErr);
        });

        return safeJson(200, {
          success: true,
          matchReason,
          user: {
            username: user.username,
            email: user.email,
            maskedEmail: maskEmail(user.email),
            name: user.name,
            role: user.role,
          },
          message: `Account credentials located! Owner ID: "${user.username}" | Registered Email: "${user.email}".`,
        });
      } catch (recoveryErr: any) {
        console.error('[Admin Forgot-ID Error]:', recoveryErr);
        return safeJson(500, {
          error: `Account recovery failed: ${recoveryErr?.message || 'Server error'}`,
          code: 'RECOVERY_SERVER_ERROR',
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION: forgot-password-request (OTP verification code)
    // -------------------------------------------------------------
    if (
      action === 'forgot-password-request' ||
      action === 'request-otp' ||
      action === 'request'
    ) {
      try {
        if (req.method !== 'POST') {
          return safeJson(405, { error: 'POST required' });
        }

        const { email, username, identifier } = req.body || {};
        const targetIdentifier = String(identifier || email || username || '').trim();

        if (!targetIdentifier) {
          return safeJson(400, { error: 'Username or registered email address is required.' });
        }

        const targetUser = findDbUserByIdentifier(targetIdentifier);
        if (!targetUser) {
          return safeJson(404, {
            error: 'No active account found for that username or email.',
          });
        }

        if (targetUser.status !== 'active') {
          return safeJson(403, {
            error: 'This account has been deactivated. Please contact the Roastery Owner.',
          });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const resetToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log(`[AUTH] Password Reset OTP for ${targetUser.email} (${targetUser.username}): ${otp}`);

        saveDbOtp(resetToken, {
          otp,
          email: targetUser.email,
          userId: targetUser.id,
          expiresAt,
        });

        await sendOtpEmail(targetUser.email, otp, targetUser.name);

        return safeJson(200, {
          success: true,
          message: `A 6-digit verification code has been dispatched to ${maskEmail(targetUser.email)}.`,
          resetToken,
          maskedEmail: maskEmail(targetUser.email),
        });
      } catch (otpErr: any) {
        console.error('[Admin Forgot-Password-Request Error]:', otpErr);
        return safeJson(500, {
          error: `Failed to generate or dispatch verification code: ${otpErr?.message || 'Server error'}`,
          code: 'OTP_REQUEST_SERVER_ERROR',
          details: String(otpErr?.stack || otpErr),
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION: forgot-password-verify-reset
    // -------------------------------------------------------------
    if (
      action === 'forgot-password-verify-reset' ||
      action === 'verify-reset' ||
      action === 'reset-password'
    ) {
      try {
        if (req.method !== 'POST') {
          return safeJson(405, { error: 'POST required' });
        }

        const { otp, newPassword, resetToken } = req.body || {};
        if (!otp || !newPassword || !resetToken) {
          return safeJson(400, {
            error: 'Verification code, new password, and resetToken are all required.',
          });
        }

        if (String(newPassword).length < 6) {
          return safeJson(400, { error: 'Password must be at least 6 characters long.' });
        }

        const record = getDbOtp(resetToken);
        if (!record) {
          return safeJson(400, {
            error: 'Password reset request has expired or is invalid. Please request a new code.',
          });
        }

        // OTP 10-minute expiry check (Phase 0 requirement)
        if (record.expiresAt && Date.now() > record.expiresAt) {
          deleteDbOtp(resetToken);
          return safeJson(400, {
            error: 'Verification code has expired (valid for 10 minutes). Please request a new code.',
          });
        }

        if (record.otp !== String(otp).trim()) {
          return safeJson(400, { error: 'Invalid verification code. Please check your email.' });
        }

        const targetUser = findDbUserById(record.userId);
        if (!targetUser) {
          deleteDbOtp(resetToken);
          return safeJson(404, { error: 'User account not found.' });
        }

        updateDbUser(targetUser.id, {
          passwordHash: hashPassword(String(newPassword)),
        });
        deleteDbOtp(resetToken);

        const sessionToken = generateSessionToken(targetUser);
        return safeJson(200, {
          success: true,
          message: 'Password successfully reset.',
          token: sessionToken,
          user: sanitizeUser(targetUser),
        });
      } catch (resetErr: any) {
        console.error('[Admin Forgot-Password-Verify-Reset Error]:', resetErr);
        return safeJson(500, {
          error: `Failed to reset password: ${resetErr?.message || 'Server error'}`,
          code: 'RESET_PASSWORD_SERVER_ERROR',
          details: String(resetErr?.stack || resetErr),
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION: change-password (Authenticated User)
    // -------------------------------------------------------------
    if (action === 'change-password') {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
      }

      const { newPassword } = req.body;
      if (!newPassword || String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      updateDbUser(auth.user.id, {
        passwordHash: hashPassword(String(newPassword)),
      });
      return res.status(200).json({ success: true, message: 'Password updated successfully' });
    }

    // -------------------------------------------------------------
    // MANAGE STAFF ACTIONS (STRICTLY OWNER ONLY)
    // -------------------------------------------------------------
    if (
      action === 'staff' ||
      action === 'staff-list' ||
      action === 'get-staff' ||
      action === 'create-staff' ||
      action === 'toggle-staff' ||
      action === 'delete-staff'
    ) {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
      }

      if (auth.user.role !== 'owner') {
        return res.status(403).json({
          error: 'Forbidden: Only the Roastery Owner can manage staff accounts.',
        });
      }

      // List Staff
      if (action === 'staff' || action === 'staff-list' || action === 'get-staff') {
        const allUsers = getDbUsers();
        const staffList = allUsers.filter((u) => u.role === 'staff').map(sanitizeUser);
        return res.status(200).json({ staff: staffList, count: staffList.length });
      }

      // Create Staff
      if (action === 'create-staff') {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'POST required to create staff' });
        }

        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) {
          return res.status(400).json({
            error: 'Staff full name, username, email, and password are all required.',
          });
        }

        const cleanUser = String(username).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanPass = String(password);

        if (cleanPass.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        if (findDbUserByIdentifier(cleanUser)) {
          return res.status(400).json({ error: `Username "${cleanUser}" is already in use.` });
        }

        if (findDbUserByIdentifier(cleanEmail)) {
          return res.status(400).json({ error: `Email "${cleanEmail}" is already registered.` });
        }

        const newStaff = createDbUser({
          name: String(name).trim(),
          username: cleanUser,
          email: cleanEmail,
          role: 'staff',
          passwordHash: hashPassword(cleanPass),
          status: 'active',
        });

        return res.status(201).json({
          success: true,
          message: `Staff account created for ${newStaff.name}`,
          staff: sanitizeUser(newStaff),
        });
      }

      // Toggle Staff Status (Active / Deactivated)
      if (action === 'toggle-staff') {
        const { id, status } = req.body;
        if (!id || (status !== 'active' && status !== 'deactivated')) {
          return res.status(400).json({ error: 'Valid staff id and status ("active" | "deactivated") are required.' });
        }

        const targetUser = findDbUserById(String(id));
        if (!targetUser) {
          return res.status(404).json({ error: 'Staff account not found.' });
        }

        if (targetUser.role === 'owner') {
          return res.status(400).json({ error: 'Cannot deactivate an Owner account.' });
        }

        const updated = updateDbUser(targetUser.id, { status });
        return res.status(200).json({
          success: true,
          message: `Staff account ${status === 'active' ? 'activated' : 'deactivated'}.`,
          staff: updated ? sanitizeUser(updated) : null,
        });
      }

      // Delete Staff Account
      if (action === 'delete-staff') {
        const targetId = String(req.body.id || req.query.id);
        if (!targetId) {
          return res.status(400).json({ error: 'Staff account id is required.' });
        }

        const targetUser = findDbUserById(targetId);
        if (!targetUser) {
          return res.status(404).json({ error: 'Staff account not found.' });
        }

        if (targetUser.role === 'owner') {
          return res.status(400).json({ error: 'Cannot delete an Owner account.' });
        }

        deleteDbUser(targetId);
        return safeJson(200, {
          success: true,
          message: `Staff account "${targetUser.name}" permanently deleted.`,
        });
      }
    }

    // -------------------------------------------------------------
    // OWNER SITE SETTINGS (OWNER ONLY)
    // -------------------------------------------------------------
    if (action === 'site-settings' || action === 'settings') {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return safeJson(401, { error: 'Unauthorized: Session invalid or expired' });
      }

      // Update Settings (Owner only)
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (auth.user.role !== 'owner') {
          return safeJson(403, { error: 'Forbidden: Only the Roastery Owner can update site settings.' });
        }
        const updated = updateDbSiteSettings(req.body.settings || req.body);
        return safeJson(200, {
          success: true,
          message: 'Site settings updated successfully',
          settings: updated,
        });
      }

      // Read Settings
      return safeJson(200, { settings: getDbSiteSettings() });
    }

    // -------------------------------------------------------------
    // PRE-ORDERS & WAITLIST (OWNER & STAFF)
    // -------------------------------------------------------------
    if (
      action === 'pre-orders' ||
      action === 'pre-orders-list' ||
      action === 'update-pre-order-status'
    ) {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return safeJson(401, { error: 'Unauthorized: Session invalid or expired' });
      }

      if (action === 'update-pre-order-status' && req.method === 'POST') {
        const { id, status } = req.body || {};
        if (!id || !status) {
          return safeJson(400, { error: 'Pre-order ID and status are required.' });
        }
        const updated = updateDbPreOrderStatus(String(id), status);
        if (!updated) {
          return safeJson(404, { error: 'Pre-order not found' });
        }
        return safeJson(200, { success: true, preOrder: updated });
      }

      const preOrders = getDbPreOrders();
      return safeJson(200, { preOrders, count: preOrders.length });
    }

    // -------------------------------------------------------------
    // CUSTOMER REVIEWS MODERATION (OWNER & STAFF)
    // -------------------------------------------------------------
    if (
      action === 'reviews' ||
      action === 'reviews-list' ||
      action === 'approve-review' ||
      action === 'reject-review' ||
      action === 'delete-review'
    ) {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return safeJson(401, { error: 'Unauthorized: Session invalid or expired' });
      }

      if (action === 'approve-review' && req.method === 'POST') {
        const id = String(req.body.id || req.query.id);
        const updated = updateDbReviewStatus(id, 'approved');
        return safeJson(200, { success: Boolean(updated), review: updated });
      }

      if (action === 'reject-review' && req.method === 'POST') {
        const id = String(req.body.id || req.query.id);
        const updated = updateDbReviewStatus(id, 'rejected');
        return safeJson(200, { success: Boolean(updated), review: updated });
      }

      if (action === 'delete-review' && (req.method === 'POST' || req.method === 'DELETE')) {
        const id = String(req.body.id || req.query.id);
        const deleted = deleteDbReview(id);
        return safeJson(200, { success: deleted });
      }

      const allReviews = getDbReviews(true); // Return all reviews for moderation
      return safeJson(200, { reviews: allReviews, count: allReviews.length });
    }

    // -------------------------------------------------------------
    // CÀ PHÊ CIRCLE MEMBERS (OWNER & STAFF)
    // -------------------------------------------------------------
    if (action === 'circle-members' || action === 'circle-members-list') {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return safeJson(401, { error: 'Unauthorized: Session invalid or expired' });
      }
      const members = getDbCircleMembers();
      return safeJson(200, { members, count: members.length });
    }

    // -------------------------------------------------------------
    // PROTECTED ACTION: Orders List for Admin / Owner / Staff
    // -------------------------------------------------------------
    if (
      action === 'orders' ||
      action === 'get-orders' ||
      action === 'order-list'
    ) {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
      }
      const orders = getDbOrders(true);
      return res.status(200).json({ orders, count: orders.length });
    }

    // -------------------------------------------------------------
    // ACTION: save-order (Direct Order Ingestion Fallback)
    // -------------------------------------------------------------
    if (action === 'save-order' && req.method === 'POST') {
      const rawOrder = (req.body.order || req.body) as any;
      if (!rawOrder) {
        return res.status(400).json({ error: 'Order data required' });
      }

      const orderId = String(rawOrder.orderId || `CP-${Math.floor(100000 + Math.random() * 900000)}`).trim();
      const items = Array.isArray(rawOrder.items) ? rawOrder.items : [];

      const newOrder = {
        orderId,
        shippingType: rawOrder.shippingType || 'standard',
        shippingAddress: String(rawOrder.shippingAddress || ''),
        cityPincode: String(rawOrder.cityPincode || ''),
        customerName: String(rawOrder.customerName || 'Valued Customer'),
        customerPhone: String(rawOrder.customerPhone || ''),
        customerEmail: String(rawOrder.customerEmail || ''),
        giftMessage: rawOrder.giftMessage,
        discountINR: Number(rawOrder.discountINR) || 0,
        finalTotalINR: Number(rawOrder.finalTotalINR) || 0,
        items,
        createdAt: rawOrder.createdAt || Date.now(),
        timestamp: rawOrder.timestamp || new Date().toISOString(),
        status: rawOrder.status || 'Order Placed & Roasting',
        courierPartner: rawOrder.courierPartner || (rawOrder.shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface'),
        trackingNumber: rawOrder.trackingNumber || `BD-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        paymentStatus: rawOrder.paymentStatus || 'paid',
        paymentId: rawOrder.paymentId,
        paymentMethod: rawOrder.paymentMethod || 'Razorpay Online',
        emailSentSuccess: rawOrder.emailSentSuccess ?? true,
        emailMessage: rawOrder.emailMessage,
      };

      const currentDbOrders = getDbOrders(true);
      const filtered = currentDbOrders.filter((o) => o.orderId.toLowerCase() !== newOrder.orderId.toLowerCase());
      const updatedOrders = [newOrder as any, ...filtered];
      updateDbOrders(updatedOrders);

      return res.status(200).json({
        success: true,
        message: `Order ${newOrder.orderId} saved via admin endpoint`,
        order: newOrder,
      });
    }

    // -------------------------------------------------------------
    // ACTION: subscribe & subscribers (Email Marketing Capture)
    // -------------------------------------------------------------
    if (action === 'subscribe' && req.method === 'POST') {
      const email = String(req.body.email || '').trim().toLowerCase();
      const source = String(req.body.source || 'exit_intent_popup').trim();
      const discountCode = String(req.body.discountCode || 'XINCHAO10').trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const { subscriber, isNew } = addDbSubscriber({ email, source, discountCode });
      return res.status(200).json({
        success: true,
        isNew,
        message: 'Subscribed successfully!',
        discountCode: subscriber.discountCode,
        subscriber,
      });
    }

    if (action === 'subscribers') {
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return res.status(401).json({ error: 'Unauthorized: Admin session required' });
      }
      const subscribers = getDbSubscribers();
      return res.status(200).json({ success: true, count: subscribers.length, subscribers });
    }

    // -------------------------------------------------------------
    // PROTECTED ACTIONS: Products, Inventory, Prices
    // -------------------------------------------------------------
    if (
      action === 'products' ||
      action === 'get-products' ||
      action === 'create-product' ||
      action === 'update-product' ||
      action === 'delete-product' ||
      action === 'inventory' ||
      action === 'update-inventory' ||
      action === 'prices' ||
      action === 'update-prices' ||
      action === 'get-status-or-products'
    ) {
      // Allow unauthenticated GET status if no token
      if (req.method === 'GET' && !token && action === 'get-status-or-products') {
        return res.status(200).json({
          isSetupComplete: isSetupDone,
          hasOwner: Boolean(ownerUser),
          username: ownerUser?.username || '',
          registeredEmail: ownerUser?.email || '',
        });
      }

      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
      }

      const products = getDbProducts();

      // Read Products / Inventory: BOTH Owner and Staff can view
      if (
        action === 'products' ||
        action === 'get-products' ||
        (action === 'get-status-or-products' && req.method === 'GET')
      ) {
        return res.status(200).json({ products, count: products.length });
      }

      // ---------------------------------------------------------
      // OWNER-ONLY RESTRICTIONS BELOW: Staff cannot modify products, inventory, prices
      // ---------------------------------------------------------
      if (auth.user.role !== 'owner') {
        return res.status(403).json({
          error: 'Forbidden: Staff accounts have view-only access and cannot modify products, inventory stock, or prices.',
        });
      }

      // Create Product (Owner Only)
      if (action === 'create-product' || (action === 'products' && req.method === 'POST')) {
        const newProduct = req.body.product || req.body;
        if (!newProduct || !newProduct.name || !newProduct.basePriceINR) {
          return res.status(400).json({ error: 'Product name and base price are required.' });
        }

        const id = newProduct.id || `custom-${Date.now()}`;
        const created: ProductItem = {
          ...newProduct,
          id,
          isActive: newProduct.isActive !== undefined ? newProduct.isActive : true,
          stockQuantity: newProduct.stockQuantity ?? 50,
          rating: newProduct.rating || 5.0,
          reviewsCount: newProduct.reviewsCount || 1,
        };

        const updated = [created, ...products];
        updateDbProducts(updated);
        return res.status(201).json({ success: true, product: created });
      }

      // Update Product (Owner Only)
      if (action === 'update-product' || (action === 'products' && (req.method === 'PUT' || req.method === 'PATCH'))) {
        const targetId = req.body.id || req.query.id;
        const updates = req.body.updates || req.body;

        const index = products.findIndex((p) => p.id === targetId);
        if (index === -1) {
          return res.status(404).json({ error: `Product ${targetId} not found.` });
        }

        products[index] = { ...products[index], ...updates };
        updateDbProducts(products);
        return res.status(200).json({ success: true, product: products[index] });
      }

      // Delete Product (Owner Only)
      if (action === 'delete-product' || (action === 'products' && req.method === 'DELETE')) {
        const targetId = req.body.id || req.query.id;
        const filtered = products.filter((p) => p.id !== targetId);
        updateDbProducts(filtered);
        return res.status(200).json({ success: true, message: `Product ${targetId} removed.` });
      }

      // Bulk Update Inventory (Owner Only)
      if (action === 'inventory' || action === 'update-inventory') {
        const stockDrafts = req.body.stockDrafts || req.body;
        if (typeof stockDrafts !== 'object' || !stockDrafts) {
          return res.status(400).json({ error: 'Invalid stockDrafts object.' });
        }

        let updatedCount = 0;
        Object.entries(stockDrafts).forEach(([id, qty]) => {
          const pIndex = products.findIndex((p) => p.id === id);
          if (pIndex !== -1 && typeof qty === 'number') {
            products[pIndex].stockQuantity = Math.max(0, qty);
            products[pIndex].isOutOfStock = qty <= 0;
            updatedCount++;
          }
        });

        updateDbProducts(products);
        return res.status(200).json({
          success: true,
          message: `Updated stock for ${updatedCount} products`,
          products,
        });
      }

      // Bulk Update Prices (Owner Only)
      if (action === 'prices' || action === 'update-prices') {
        const priceDrafts = req.body.priceDrafts || req.body;
        if (typeof priceDrafts !== 'object' || !priceDrafts) {
          return res.status(400).json({ error: 'Invalid priceDrafts object.' });
        }

        let updatedCount = 0;
        Object.entries(priceDrafts).forEach(([id, price]) => {
          const pIndex = products.findIndex((p) => p.id === id);
          if (pIndex !== -1 && typeof price === 'number') {
            products[pIndex].basePriceINR = Math.max(1, price);
            updatedCount++;
          }
        });

        updateDbProducts(products);
        return res.status(200).json({
          success: true,
          message: `Updated prices for ${updatedCount} products`,
          products,
        });
      }
    }

    return res.status(400).json({
      error: `Unknown action: '${action}'. Supported actions: setup-status, setup, login, verify, logout, change-password, forgot-password-request, forgot-password-verify-reset, staff-list, create-staff, toggle-staff, delete-staff, get-products, create-product, update-product, delete-product, update-inventory, update-prices.`,
    });
  } catch (err: any) {
    console.error('[Admin Handler Error]:', err);
    return safeJson(500, { error: err?.message || 'Internal server error in admin handler' });
  }
}
