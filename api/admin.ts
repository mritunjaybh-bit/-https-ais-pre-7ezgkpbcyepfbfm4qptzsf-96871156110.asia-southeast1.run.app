import { Request, Response } from 'express';
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
  saveDbOtp,
  getDbOtp,
  deleteDbOtp,
  removeDbSession,
  UserAccount,
} from './_lib/db';
import {
  generateSessionToken,
  verifySessionToken,
  clearInMemorySessions,
  maskEmail,
  sendOtpEmail,
} from './_lib/auth-util';
import { ProductItem } from '../src/types';

function sanitizeUser(u: UserAccount) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export default async function handler(req: any, res: any) {
  return adminHandler(req, res);
}

export async function adminHandler(req: Request, res: Response) {
  // CORS Headers
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
  const ownerUser = users.find((u) => u.role === 'owner' && u.status === 'active');
  const isSetupDone = Boolean(config.isSetupComplete && ownerUser);

  try {
    // -------------------------------------------------------------
    // ACTION: setup-status
    // -------------------------------------------------------------
    if (action === 'setup-status' || action === 'status') {
      return res.status(200).json({
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
      resetDatabaseAuth();
      clearInMemorySessions();
      return res.status(200).json({
        success: true,
        message: 'All admin/owner/staff accounts deleted. Database reset to fresh setup.',
        isSetupComplete: false,
      });
    }

    // -------------------------------------------------------------
    // ACTION: setup (Initial One-Time Owner Account Setup)
    // -------------------------------------------------------------
    if (action === 'setup') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required for setup' });
      }

      if (isSetupDone) {
        return res.status(400).json({
          error: 'Setup has already been completed. Please log in using your Owner credentials.',
        });
      }

      const { username, email, password, name } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
      }

      const cleanUser = String(username).trim();
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPass = String(password);

      if (cleanPass.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      // Check uniqueness
      if (findDbUserByIdentifier(cleanUser) || findDbUserByIdentifier(cleanEmail)) {
        return res.status(400).json({ error: 'An account with that username or email already exists.' });
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
      return res.status(200).json({
        success: true,
        message: 'Owner account successfully initialized.',
        token: sessionToken,
        user: sanitizeUser(newOwner),
      });
    }

    // -------------------------------------------------------------
    // ACTION: login (Owner and Staff)
    // -------------------------------------------------------------
    if (action === 'login') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required for login' });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username/email and password are required.' });
      }

      // Check if setup is complete
      if (!isSetupDone) {
        return res.status(403).json({
          error: 'Setup is required. Please visit /setup to create the Owner account.',
          requiresSetup: true,
        });
      }

      const user = findDbUserByIdentifier(String(username));
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials. Please verify your username and password.',
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          error: 'This account has been deactivated. Please contact the Roastery Owner.',
        });
      }

      const passMatches = verifyPassword(String(password), user.passwordHash);
      if (!passMatches) {
        return res.status(401).json({
          error: 'Invalid credentials. Please verify your username and password.',
        });
      }

      updateDbUser(user.id, { lastLoginAt: new Date().toISOString() });
      const sessionToken = generateSessionToken(user);

      return res.status(200).json({
        success: true,
        token: sessionToken,
        user: sanitizeUser(user),
      });
    }

    // -------------------------------------------------------------
    // ACTION: verify (Session verification)
    // -------------------------------------------------------------
    if (action === 'verify') {
      const auth = verifySessionToken(token);
      if (auth.valid && auth.user) {
        return res.status(200).json({
          valid: true,
          user: sanitizeUser(auth.user),
        });
      }
      return res.status(401).json({ valid: false, error: auth.error || 'Session expired or invalid' });
    }

    // -------------------------------------------------------------
    // ACTION: logout
    // -------------------------------------------------------------
    if (action === 'logout') {
      if (token) {
        removeDbSession(token);
      }
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    // -------------------------------------------------------------
    // ACTION: forgot-password-request (OTP verification code)
    // -------------------------------------------------------------
    if (
      action === 'forgot-password-request' ||
      action === 'request-otp' ||
      action === 'request'
    ) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required' });
      }

      const { email, username, identifier } = req.body;
      const targetIdentifier = String(identifier || email || username || '').trim();

      if (!targetIdentifier) {
        return res.status(400).json({ error: 'Username or registered email address is required.' });
      }

      const targetUser = findDbUserByIdentifier(targetIdentifier);
      if (!targetUser) {
        return res.status(404).json({
          error: 'No active account found for that username or email.',
        });
      }

      if (targetUser.status !== 'active') {
        return res.status(403).json({
          error: 'This account has been deactivated. Please contact the Roastery Owner.',
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      saveDbOtp(resetToken, {
        otp,
        email: targetUser.email,
        userId: targetUser.id,
        expiresAt,
      });

      await sendOtpEmail(targetUser.email, otp, targetUser.name);

      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${maskEmail(targetUser.email)}.`,
        resetToken,
        maskedEmail: maskEmail(targetUser.email),
      });
    }

    // -------------------------------------------------------------
    // ACTION: forgot-password-verify-reset
    // -------------------------------------------------------------
    if (
      action === 'forgot-password-verify-reset' ||
      action === 'verify-reset' ||
      action === 'reset-password'
    ) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required' });
      }

      const { otp, newPassword, resetToken } = req.body;
      if (!otp || !newPassword || !resetToken) {
        return res.status(400).json({
          error: 'Verification code, new password, and resetToken are all required.',
        });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const record = getDbOtp(resetToken);
      if (!record) {
        return res.status(400).json({
          error: 'Password reset request has expired or is invalid. Please request a new code.',
        });
      }

      if (record.otp !== String(otp).trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please check your email.' });
      }

      const targetUser = findDbUserById(record.userId);
      if (!targetUser) {
        deleteDbOtp(resetToken);
        return res.status(404).json({ error: 'User account not found.' });
      }

      updateDbUser(targetUser.id, {
        passwordHash: hashPassword(String(newPassword)),
      });
      deleteDbOtp(resetToken);

      const sessionToken = generateSessionToken(targetUser);
      return res.status(200).json({
        success: true,
        message: 'Password successfully reset.',
        token: sessionToken,
        user: sanitizeUser(targetUser),
      });
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
        return res.status(200).json({
          success: true,
          message: `Staff account "${targetUser.name}" permanently deleted.`,
        });
      }
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
    return res.status(500).json({ error: err?.message || 'Internal server error in admin handler' });
  }
}
