import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  getDbAdminConfig,
  updateDbAdminConfig,
  updateDbAdminPassword,
  hashPassword,
  verifyPassword,
  getDbProducts,
  updateDbProducts,
  saveDbOtp,
  getDbOtp,
  deleteDbOtp,
  removeDbSession,
} from './_lib/db';
import {
  generateSessionToken,
  isValidSession,
  maskEmail,
  sendOtpEmail,
} from './_lib/auth-util';
import { ProductItem } from '../src/types';

export default async function handler(req: any, res: any) {
  return adminHandler(req, res);
}

export async function adminHandler(req: Request, res: Response) {
  // CORS
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

  // Determine Action from:
  // 1. req.body.action
  // 2. req.query.action
  // 3. req.query.subpath
  // 4. URL path suffix (e.g. /api/admin/login -> 'login')
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

  try {
    // -------------------------------------------------------------
    // ACTION: setup-status
    // -------------------------------------------------------------
    if (action === 'setup-status' || action === 'status') {
      return res.status(200).json({
        isSetupComplete: Boolean(config.isSetupComplete),
        registeredEmail: config.email || 'mritunjaybh@gmail.com',
        username: config.username || 'owner',
      });
    }

    // -------------------------------------------------------------
    // ACTION: setup (Initial One-Time Roastery Owner Account Setup)
    // -------------------------------------------------------------
    if (action === 'setup') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required for setup' });
      }

      if (config.isSetupComplete) {
        return res.status(400).json({
          error: 'Setup has already been completed. Please log in using your administrator password.',
        });
      }

      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const passwordHash = hashPassword(password);
      updateDbAdminConfig({
        username: username.trim(),
        email: email.trim(),
        passwordHash,
        isSetupComplete: true,
        setupAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      const sessionToken = generateSessionToken(username.trim());
      return res.status(200).json({
        success: true,
        message: 'Owner account successfully initialized.',
        token: sessionToken,
        username: username.trim(),
        email: email.trim(),
      });
    }

    // -------------------------------------------------------------
    // ACTION: login
    // -------------------------------------------------------------
    if (action === 'login') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required for login' });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const cleanUser = String(username).trim();
      const cleanPass = String(password);

      // Check if setup was ever performed
      if (!config.isSetupComplete && !config.passwordHash) {
        return res.status(403).json({
          error: 'Setup is required. Please visit /setup to configure your admin account.',
          requiresSetup: true,
        });
      }

      const userMatches =
        cleanUser.toLowerCase() === config.username.toLowerCase() ||
        cleanUser.toLowerCase() === config.email.toLowerCase();

      let passMatches = false;
      if (config.passwordHash) {
        passMatches = verifyPassword(cleanPass, config.passwordHash);
      } else if (config.password) {
        passMatches = cleanPass === config.password;
        if (passMatches) {
          updateDbAdminPassword(cleanPass);
        }
      }

      if (!userMatches || !passMatches) {
        return res.status(401).json({
          error: 'Invalid credentials. Please verify your username and password.',
        });
      }

      updateDbAdminConfig({ lastLoginAt: new Date().toISOString() });
      const sessionToken = generateSessionToken(config.username);

      return res.status(200).json({
        success: true,
        token: sessionToken,
        username: config.username,
        email: config.email,
      });
    }

    // -------------------------------------------------------------
    // ACTION: verify (Session verification)
    // -------------------------------------------------------------
    if (action === 'verify') {
      const valid = isValidSession(token);
      if (valid) {
        return res.status(200).json({
          valid: true,
          username: config.username,
          email: config.email,
        });
      }
      return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
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
    // ACTION: forgot-password-request (or 'request-otp')
    // -------------------------------------------------------------
    if (
      action === 'forgot-password-request' ||
      action === 'request-otp' ||
      action === 'request'
    ) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required' });
      }

      const { email } = req.body;
      const targetEmail = (email || config.email || 'mritunjaybh@gmail.com').trim().toLowerCase();

      if (config.email && targetEmail !== config.email.toLowerCase()) {
        return res.status(400).json({
          error: `The email provided does not match the registered owner email.`,
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      saveDbOtp(resetToken, { otp, email: targetEmail, expiresAt });
      await sendOtpEmail(targetEmail, otp);

      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${maskEmail(targetEmail)}.`,
        resetToken,
        maskedEmail: maskEmail(targetEmail),
      });
    }

    // -------------------------------------------------------------
    // ACTION: forgot-password-verify-reset (or 'verify-reset')
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

      updateDbAdminPassword(String(newPassword));
      deleteDbOtp(resetToken);

      const sessionToken = generateSessionToken(config.username);
      return res.status(200).json({
        success: true,
        message: 'Password successfully reset.',
        token: sessionToken,
      });
    }

    // -------------------------------------------------------------
    // ACTION: change-password (Authenticated Password Update)
    // -------------------------------------------------------------
    if (action === 'change-password') {
      if (!isValidSession(token)) {
        return res.status(401).json({ error: 'Unauthorized: Admin session required' });
      }

      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      updateDbAdminPassword(newPassword);
      return res.status(200).json({ success: true, message: 'Password updated successfully' });
    }

    // -------------------------------------------------------------
    // PROTECTED ADMIN ACTIONS: Products, Inventory, Prices
    // -------------------------------------------------------------
    // All following actions require valid session
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
      if (!isValidSession(token)) {
        // If GET and no token provided, return setup status
        if (req.method === 'GET' && !token) {
          return res.status(200).json({
            isSetupComplete: Boolean(config.isSetupComplete),
            registeredEmail: config.email || 'mritunjaybh@gmail.com',
            username: config.username || 'owner',
          });
        }
        return res.status(401).json({ error: 'Unauthorized: Admin session invalid or expired' });
      }

      const products = getDbProducts();

      // List Products
      if (
        action === 'products' ||
        action === 'get-products' ||
        (action === 'get-status-or-products' && req.method === 'GET')
      ) {
        return res.status(200).json({ products, count: products.length });
      }

      // Create Product
      if (action === 'create-product' || (action === 'products' && req.method === 'POST')) {
        const newProduct = req.body.product || req.body;
        if (!newProduct || !newProduct.name || !newProduct.basePriceINR) {
          return res.status(400).json({ error: 'Product name and base price are required' });
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

      // Update Product
      if (action === 'update-product' || (action === 'products' && (req.method === 'PUT' || req.method === 'PATCH'))) {
        const targetId = req.body.id || req.query.id;
        const updates = req.body.updates || req.body;

        const index = products.findIndex((p) => p.id === targetId);
        if (index === -1) {
          return res.status(404).json({ error: `Product ${targetId} not found` });
        }

        products[index] = { ...products[index], ...updates };
        updateDbProducts(products);
        return res.status(200).json({ success: true, product: products[index] });
      }

      // Delete Product
      if (action === 'delete-product' || (action === 'products' && req.method === 'DELETE')) {
        const targetId = req.body.id || req.query.id;
        const filtered = products.filter((p) => p.id !== targetId);
        updateDbProducts(filtered);
        return res.status(200).json({ success: true, message: `Product ${targetId} removed` });
      }

      // Bulk Update Inventory
      if (action === 'inventory' || action === 'update-inventory') {
        const stockDrafts = req.body.stockDrafts || req.body;
        if (typeof stockDrafts !== 'object' || !stockDrafts) {
          return res.status(400).json({ error: 'Invalid stockDrafts object' });
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

      // Bulk Update Prices
      if (action === 'prices' || action === 'update-prices') {
        const priceDrafts = req.body.priceDrafts || req.body;
        if (typeof priceDrafts !== 'object' || !priceDrafts) {
          return res.status(400).json({ error: 'Invalid priceDrafts object' });
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
      error: `Unknown action: '${action}'. Supported actions: setup-status, setup, login, verify, logout, change-password, forgot-password-request, forgot-password-verify-reset, get-products, create-product, update-product, delete-product, update-inventory, update-prices.`,
    });
  } catch (err: any) {
    console.error('[Admin Handler Error]:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error in admin handler' });
  }
}
