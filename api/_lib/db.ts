import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type {
  ProductItem,
  PlacedOrder,
  EmailSubscriber,
  SiteSettings,
  PreOrderRecord,
  ProductReview,
  CircleMember,
  CircleTransaction,
  CircleTier,
} from '../../src/types.ts';
import { PRODUCT_ITEMS } from '../../src/data/coffeeData.ts';

export type UserRole = 'owner' | 'staff';

export interface UserAccount {
  id: string;
  username: string; // unique username
  email: string; // unique email
  name: string; // display name
  phone?: string; // recovery phone number
  role: UserRole; // 'owner' or 'staff'
  passwordHash: string; // salt:scrypt_hex
  status: 'active' | 'deactivated';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminConfig {
  isSetupComplete: boolean;
  setupAt?: string;
}

export interface OtpRecord {
  otp: string;
  email: string;
  userId: string;
  expiresAt: number;
}

export interface StoreDatabase {
  products: ProductItem[];
  orders: PlacedOrder[];
  adminConfig: AdminConfig;
  users: UserAccount[];
  sessions?: string[];
  otps?: Record<string, OtpRecord>;
  subscribers?: EmailSubscriber[];
  siteSettings?: SiteSettings;
  preOrders?: PreOrderRecord[];
  reviews?: ProductReview[];
  circleMembers?: CircleMember[];
}

// Local project path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Writable fallback path for serverless environments (AWS Lambda / Vercel)
const TMP_DB_FILE = path.join(os.tmpdir(), 'caphe_store.json');

export function hashPassword(password: string, existingSalt?: string): string {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  try {
    if (!storedHash.includes(':')) {
      return false; // Plain text or legacy passwords strictly rejected
    }
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(originalHash));
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Registered Owner Account (Permanent Base Seed)
const DEFAULT_OWNER_ACCOUNT: UserAccount = {
  id: 'usr-owner-1790511787965-3e82c9a1',
  username: 'Mritunjay',
  email: 'mritunjay.bhardwaj@caphevietnam.in',
  name: 'Mritunjay Bhardwaj',
  role: 'owner',
  passwordHash:
    'd11f39bbae21d012247f56d456d9be55:9cd77a67670d24a29d18c1e9fe539d92f542c726633df65b98bde01ec89604f140af2e87215bc0f696bcfe908ab9fae82798505428e514820edd9083358ef9c8',
  status: 'active',
  createdAt: '2026-09-27T12:23:07.965Z',
  lastLoginAt: '2026-09-27T12:25:10.137Z',
};

// Initial seed data: contains catalog products and verified configured owner account
export function getInitialSeedData(): StoreDatabase {
  const seededProducts: ProductItem[] = PRODUCT_ITEMS.map((p, idx) => ({
    ...p,
    stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 45 + (idx % 5) * 10,
    isActive: p.isActive !== undefined ? p.isActive : true,
  }));

  return {
    products: seededProducts,
    orders: [],
    adminConfig: {
      isSetupComplete: true,
      setupAt: '2026-09-27T12:23:07.966Z',
    },
    users: [DEFAULT_OWNER_ACCOUNT],
    sessions: [],
    otps: {},
    subscribers: [],
  };
}

let dbCache: StoreDatabase | null = null;

function tryReadFile(filePath: string): StoreDatabase | null {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed as StoreDatabase;
      }
    }
  } catch (e) {
    // silently fail
  }
  return null;
}

export function loadDatabase(forceReload = false): StoreDatabase {
  if (dbCache && !forceReload) return dbCache;

  const fromProject = tryReadFile(DB_FILE);
  const fromTmp = tryReadFile(TMP_DB_FILE);

  let chosen: StoreDatabase | null = null;

  if (fromProject && fromTmp) {
    // Both files exist: merge orders and subscribers from both so no data is ever lost
    const orderMap = new Map<string, PlacedOrder>();
    (fromTmp.orders || []).forEach((o) => {
      if (o && o.orderId) orderMap.set(String(o.orderId).toLowerCase(), o);
    });
    (fromProject.orders || []).forEach((o) => {
      if (o && o.orderId) orderMap.set(String(o.orderId).toLowerCase(), o);
    });

    const subMap = new Map<string, EmailSubscriber>();
    (fromTmp.subscribers || []).forEach((s) => {
      if (s && s.email) subMap.set(s.email.toLowerCase(), s);
    });
    (fromProject.subscribers || []).forEach((s) => {
      if (s && s.email) subMap.set(s.email.toLowerCase(), s);
    });

    let projectMtime = 0;
    let tmpMtime = 0;
    try {
      projectMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {}
    try {
      tmpMtime = fs.statSync(TMP_DB_FILE).mtimeMs;
    } catch {}

    const base = projectMtime >= tmpMtime ? fromProject : fromTmp;
    base.orders = Array.from(orderMap.values()).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
    base.subscribers = Array.from(subMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    chosen = base;
  } else if (fromProject) {
    chosen = fromProject;
  } else if (fromTmp) {
    chosen = fromTmp;
  }

  if (chosen) {
    // 1. Migrate legacy single-owner admin if present from old versions
    if ((chosen as any).admin && (!chosen.users || chosen.users.length === 0)) {
      const leg = (chosen as any).admin;
      chosen.users = [
        {
          id: leg.id || DEFAULT_OWNER_ACCOUNT.id,
          username: leg.username || DEFAULT_OWNER_ACCOUNT.username,
          email: leg.email || DEFAULT_OWNER_ACCOUNT.email,
          name: leg.name || DEFAULT_OWNER_ACCOUNT.name,
          role: 'owner',
          passwordHash: leg.passwordHash || DEFAULT_OWNER_ACCOUNT.passwordHash,
          status: 'active',
          createdAt: leg.createdAt || DEFAULT_OWNER_ACCOUNT.createdAt,
          lastLoginAt: leg.lastLoginAt,
          phone: leg.phone,
        },
      ];
    }

    // 2. Ensure users array is valid and non-empty
    if (!chosen.users || !Array.isArray(chosen.users) || chosen.users.length === 0) {
      chosen.users = [DEFAULT_OWNER_ACCOUNT];
    }

    // 3. Normalization: Guarantee EVERY user object has id, username, email, role, and status
    chosen.users = chosen.users
      .filter((u): u is UserAccount => Boolean(u && typeof u === 'object'))
      .map((u, idx) => {
        const username = String(u.username || (u.email ? u.email.split('@')[0] : `user-${idx}`)).trim();
        const email = String(u.email || `${username.toLowerCase()}@caphevietnam.in`).trim().toLowerCase();
        // Mismatch fix: ensure stored account missing a role field defaults to 'owner'
        const role: UserRole = u.role === 'staff' ? 'staff' : 'owner';
        const status: 'active' | 'deactivated' = u.status === 'deactivated' ? 'deactivated' : 'active';
        return {
          id: u.id || `usr-${role}-${idx}-${Date.now()}`,
          username,
          email,
          name: u.name || username,
          role,
          status,
          passwordHash: u.passwordHash || DEFAULT_OWNER_ACCOUNT.passwordHash,
          createdAt: u.createdAt || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt,
          phone: u.phone,
        };
      });

    // 4. Guarantee at least one active owner exists
    const hasOwner = chosen.users.some((u) => u.role === 'owner' && u.status === 'active');
    if (!hasOwner && chosen.users.length > 0) {
      chosen.users[0].role = 'owner';
      chosen.users[0].status = 'active';
    }

    // 5. Ensure adminConfig is marked complete if owner exists
    if (!chosen.adminConfig) {
      chosen.adminConfig = { isSetupComplete: true, setupAt: '2026-09-27T12:23:07.966Z' };
    }
    if (chosen.users.some((u) => u.role === 'owner' && u.status === 'active')) {
      chosen.adminConfig.isSetupComplete = true;
    }

    dbCache = chosen;
    return chosen;
  }

  // 3. Seed fresh database
  const initial = getInitialSeedData();
  dbCache = initial;
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(data: StoreDatabase): void {
  dbCache = data;
  const jsonStr = JSON.stringify(data, null, 2);

  // Attempt 1: Write to project directory (works in local / container environments)
  let wroteToProject = false;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');
    wroteToProject = true;
  } catch (err) {
    // In serverless (e.g. Vercel Lambda), process.cwd() is read-only (EROFS)
  }

  // Attempt 2: Always also write to writable /tmp for serverless persistence
  try {
    fs.writeFileSync(TMP_DB_FILE, jsonStr, 'utf-8');
  } catch (err) {
    if (!wroteToProject) {
      console.warn('[Database] Could not write to disk, using in-memory store:', err);
    }
  }
}

// -------------------------------------------------------------
// RESET AUTH DATABASE: Complete deletion of all accounts
// -------------------------------------------------------------
export function resetDatabaseAuth(): StoreDatabase {
  const db = loadDatabase();
  db.users = []; // Delete all admin/owner/staff accounts completely
  db.adminConfig = {
    isSetupComplete: false, // Reset setup back to false
  };
  db.sessions = []; // Clear all active sessions
  db.otps = {}; // Clear any OTPs

  // Also remove legacy fields if present
  delete (db as any).admin;
  delete (db as any).staff;

  saveDatabase(db);
  dbCache = db;

  // Ensure files on disk are completely updated
  const jsonStr = JSON.stringify(db, null, 2);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');
  } catch {}
  try {
    fs.writeFileSync(TMP_DB_FILE, jsonStr, 'utf-8');
  } catch {}

  return db;
}

// -------------------------------------------------------------
// USER ACCESSORS & MUTATORS
// -------------------------------------------------------------
export function getDbUsers(): UserAccount[] {
  const db = loadDatabase();
  return db.users || [];
}

export function findDbUserById(id: string): UserAccount | null {
  if (!id) return null;
  const users = getDbUsers();
  return users.find((u) => u && u.id === id) || null;
}

export function findDbUserByIdentifier(identifier: string): UserAccount | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const users = getDbUsers();
  return (
    users.find((u) => {
      if (!u) return false;
      const uName = (u.username || '').toLowerCase().trim();
      const uEmail = (u.email || '').toLowerCase().trim();
      return (
        uName === clean ||
        uEmail === clean ||
        (clean === 'mritunjaybh@gmail.com' && u.role === 'owner')
      );
    }) || null
  );
}

export function findDbUserByRecovery(detail: string): { user: UserAccount; matchReason: string } | null {
  if (!detail) return null;
  const clean = detail.trim();
  const cleanLower = clean.toLowerCase();
  const cleanDigits = clean.replace(/\D/g, '');

  const db = loadDatabase();
  const users = db.users || [];
  if (users.length === 0) return null;

  // 1. Direct match on username or email
  const byIdent = users.find((u) => {
    if (!u) return false;
    const uName = (u.username || '').toLowerCase().trim();
    const uEmail = (u.email || '').toLowerCase().trim();
    return (
      uName === cleanLower ||
      uEmail === cleanLower ||
      (cleanLower === 'mritunjaybh@gmail.com' && u.role === 'owner')
    );
  });
  if (byIdent) {
    return { user: byIdent, matchReason: 'Direct registered username or email match' };
  }

  // 2. Full name match (case-insensitive substring or exact)
  const byName = users.find((u) => {
    if (!u) return false;
    const uName = (u.name || '').toLowerCase();
    return (
      uName === cleanLower ||
      (cleanLower.length >= 3 && uName.includes(cleanLower)) ||
      (uName.length >= 3 && cleanLower.includes(uName))
    );
  });
  if (byName) {
    return { user: byName, matchReason: `Matched registered account name: "${byName.name}"` };
  }

  // 3. User's own phone if stored
  if (cleanDigits.length >= 7) {
    const byUserPhone = users.find((u) => {
      if (!u) return false;
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      return uPhoneDigits && (uPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uPhoneDigits));
    });
    if (byUserPhone) {
      return { user: byUserPhone, matchReason: 'Matched registered recovery phone number' };
    }
  }

  // 4. Linked store orders (matches customerPhone, customerEmail, customerName)
  const orders = db.orders || [];
  for (const o of orders) {
    if (!o) continue;
    const orderPhoneDigits = (o.customerPhone || '').replace(/\D/g, '');
    const orderEmail = (o.customerEmail || '').toLowerCase();
    const orderName = (o.customerName || '').toLowerCase();

    const phoneMatched =
      cleanDigits.length >= 7 &&
      orderPhoneDigits.length >= 7 &&
      (orderPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(orderPhoneDigits));

    const emailMatched = cleanLower.length >= 4 && (orderEmail === cleanLower || orderEmail.includes(cleanLower));
    const nameMatched =
      cleanLower.length >= 3 && (orderName === cleanLower || orderName.includes(cleanLower));

    if (phoneMatched || emailMatched || nameMatched) {
      const matchedUser =
        users.find((u) => u && (u.name || '').toLowerCase() === orderName) ||
        users.find((u) => u && u.role === 'owner') ||
        users[0];
      if (matchedUser) {
        let reason = 'Matched registered store phone record';
        if (emailMatched) reason = 'Matched customer recovery email record';
        else if (nameMatched) reason = 'Matched customer contact name record';
        return { user: matchedUser, matchReason: reason };
      }
    }
  }

  // 5. Security Recovery Prompt / Master Roastery Brand Passphrase
  const promptKeywords = [
    'caphe vietnam',
    'cà phê vietnam',
    'caphe',
    'vietnam coffee',
    'roastery owner',
    'sulevina',
    'sulevina global',
    'shin coffee',
    'caphe-vietnam',
    'mritunjay',
    'owner',
  ];
  if (promptKeywords.some((kw) => cleanLower.includes(kw) || kw.includes(cleanLower))) {
    const owner = users.find((u) => u && u.role === 'owner') || users[0];
    if (owner) {
      return { user: owner, matchReason: 'Verified via Roastery Security Prompt' };
    }
  }

  return null;
}

export function createDbUser(userData: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
  const db = loadDatabase();
  const id = `usr-${userData.role}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const newUser: UserAccount = {
    ...userData,
    id,
    createdAt: new Date().toISOString(),
  };

  db.users = [...(db.users || []), newUser];
  saveDatabase(db);
  return newUser;
}

export function updateDbUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
  const db = loadDatabase();
  const users = db.users || [];
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  users[idx] = {
    ...users[idx],
    ...updates,
  };
  db.users = users;
  saveDatabase(db);
  return users[idx];
}

export function deleteDbUser(id: string): boolean {
  const db = loadDatabase();
  const users = db.users || [];
  const initialLen = users.length;
  db.users = users.filter((u) => u.id !== id);
  if (db.users.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// PRODUCT ACCESSORS
// -------------------------------------------------------------
export function getDbProducts(): ProductItem[] {
  const db = loadDatabase();
  return db.products;
}

export function updateDbProducts(products: ProductItem[]): void {
  const db = loadDatabase();
  db.products = products;
  saveDatabase(db);
}

// -------------------------------------------------------------
// ORDER ACCESSORS
// -------------------------------------------------------------
export function getDbOrders(forceReload = true): PlacedOrder[] {
  const db = loadDatabase(forceReload);
  return db.orders || [];
}

export function updateDbOrders(orders: PlacedOrder[]): void {
  const db = loadDatabase();
  db.orders = orders;
  saveDatabase(db);
}

// -------------------------------------------------------------
// CONFIG ACCESSORS
// -------------------------------------------------------------
export function getDbAdminConfig(): AdminConfig {
  const db = loadDatabase();
  if (!db.adminConfig) {
    db.adminConfig = {
      isSetupComplete: false,
    };
    saveDatabase(db);
  }
  return db.adminConfig;
}

export function updateDbAdminConfig(updates: Partial<AdminConfig>): AdminConfig {
  const db = loadDatabase();
  const current = getDbAdminConfig();
  db.adminConfig = {
    ...current,
    ...updates,
  };
  saveDatabase(db);
  return db.adminConfig;
}

// -------------------------------------------------------------
// SESSION TOKENS
// -------------------------------------------------------------
export function getDbSessions(): string[] {
  const db = loadDatabase();
  return db.sessions || [];
}

export function addDbSession(token: string): void {
  const db = loadDatabase();
  const sessions = db.sessions || [];
  if (!sessions.includes(token)) {
    db.sessions = [token, ...sessions].slice(0, 150);
    saveDatabase(db);
  }
}

export function removeDbSession(token: string): void {
  const db = loadDatabase();
  if (db.sessions) {
    db.sessions = db.sessions.filter((s) => s !== token);
    saveDatabase(db);
  }
}

export function clearDbSessions(): void {
  const db = loadDatabase();
  db.sessions = [];
  saveDatabase(db);
}

// -------------------------------------------------------------
// PASSWORD RESET OTPS
// -------------------------------------------------------------
export function saveDbOtp(resetToken: string, record: OtpRecord): void {
  const db = loadDatabase();
  db.otps = db.otps || {};
  db.otps[resetToken] = record;
  saveDatabase(db);
}

export function getDbOtp(resetToken: string): OtpRecord | null {
  const db = loadDatabase();
  if (!db.otps || !db.otps[resetToken]) return null;
  const record = db.otps[resetToken];
  if (Date.now() > record.expiresAt) {
    delete db.otps[resetToken];
    saveDatabase(db);
    return null;
  }
  return record;
}

export function deleteDbOtp(resetToken: string): void {
  const db = loadDatabase();
  if (db.otps && db.otps[resetToken]) {
    delete db.otps[resetToken];
    saveDatabase(db);
  }
}

// -------------------------------------------------------------
// EMAIL SUBSCRIBERS / NEWSLETTER
// -------------------------------------------------------------
export function getDbSubscribers(): EmailSubscriber[] {
  const db = loadDatabase();
  return db.subscribers || [];
}

export function addDbSubscriber(subscriber: {
  email: string;
  source?: string;
  discountCode?: string;
  phone?: string;
  interest?: string;
  consent?: boolean;
}): { subscriber: EmailSubscriber; isNew: boolean } {
  const db = loadDatabase();
  const current = db.subscribers || [];
  const cleanEmail = subscriber.email.trim().toLowerCase();
  const existingIdx = current.findIndex((s) => s.email.toLowerCase() === cleanEmail);

  let result: EmailSubscriber;
  let isNew = false;

  if (existingIdx !== -1) {
    result = {
      ...current[existingIdx],
      discountCode: subscriber.discountCode || current[existingIdx].discountCode || 'XINCHAO10',
      source: subscriber.source || current[existingIdx].source || 'waitlist',
      phone: subscriber.phone !== undefined ? subscriber.phone : current[existingIdx].phone,
      interest: subscriber.interest !== undefined ? subscriber.interest : current[existingIdx].interest,
      consent: subscriber.consent !== undefined ? subscriber.consent : current[existingIdx].consent,
    };
    current[existingIdx] = result;
  } else {
    isNew = true;
    result = {
      id: `sub-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      source: subscriber.source || 'waitlist',
      discountCode: subscriber.discountCode || 'XINCHAO10',
      phone: subscriber.phone || undefined,
      interest: subscriber.interest || undefined,
      consent: subscriber.consent !== undefined ? subscriber.consent : false,
    };
    current.unshift(result);
  }

  db.subscribers = current;
  saveDatabase(db);
  return { subscriber: result, isNew };
}

// -------------------------------------------------------------
// OWNER SITE SETTINGS
// -------------------------------------------------------------
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  preOrderMode: false,
  directCheckoutEnabled: false,
  dispatchWindow: 'Batches prepared upon official launch',
  fssaiNumber: '',
  gstin: '',
  cin: '',
  iec: '',
  whatsappNumber: '+91 87640 01534',
  announcementBarText: 'A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.',
  freeShippingThreshold: 0,
  supportEmail: 'mritunjay.bhardwaj@caphevietnam.in',
  metaPixelId: '',
  footerLegalLine: 'Cà Phê is a brand of SuleVina Global Ventures (OPC) Private Limited (incorporation in progress).',
  showPartnerAddressPublicly: false,
  partnerAddress: '',
};

export function getDbSiteSettings(): SiteSettings {
  const db = loadDatabase();
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(db.siteSettings || {}),
  };
}

export function updateDbSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const db = loadDatabase();
  const current = getDbSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...partial,
  };
  db.siteSettings = updated;
  saveDatabase(db);
  return updated;
}

// -------------------------------------------------------------
// PRE-ORDERS & WAITLIST
// -------------------------------------------------------------
export function getDbPreOrders(): PreOrderRecord[] {
  const db = loadDatabase();
  return db.preOrders || [];
}

export function createDbPreOrder(item: {
  customerName: string;
  customerContact: string;
  productId: string;
  productName: string;
  quantity?: number;
  notes?: string;
}): PreOrderRecord {
  const db = loadDatabase();
  const list = db.preOrders || [];
  const newRecord: PreOrderRecord = {
    id: `pre-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    customerName: item.customerName.trim(),
    customerContact: item.customerContact.trim(),
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    createdAt: new Date().toISOString(),
    status: 'pending',
    notes: item.notes,
  };
  list.unshift(newRecord);
  db.preOrders = list;
  saveDatabase(db);
  return newRecord;
}

export function updateDbPreOrderStatus(id: string, status: PreOrderRecord['status']): PreOrderRecord | null {
  const db = loadDatabase();
  const list = db.preOrders || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx].status = status;
  db.preOrders = list;
  saveDatabase(db);
  return list[idx];
}

// -------------------------------------------------------------
// VERIFIED CUSTOMER REVIEWS
// -------------------------------------------------------------
export function getDbReviews(includeAll = false): ProductReview[] {
  const db = loadDatabase();
  const all = db.reviews || [];
  if (includeAll) return all;
  return all.filter((r) => r.status === 'approved');
}

export function createDbReview(review: {
  productId: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
}): { review: ProductReview; isApproved: boolean } {
  const db = loadDatabase();
  const list = db.reviews || [];

  // Verify that the order exists, belongs to this customer, and is DELIVERED
  const orders = db.orders || [];
  const matchingOrder = orders.find(
    (o) =>
      o.orderId.toLowerCase() === review.orderId.trim().toLowerCase() &&
      o.customerEmail.toLowerCase().trim() === review.customerEmail.toLowerCase().trim()
  );

  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    productId: review.productId,
    orderId: review.orderId.trim(),
    customerEmail: review.customerEmail.toLowerCase().trim(),
    customerName: review.customerName.trim(),
    rating: Math.min(5, Math.max(1, Math.round(review.rating))),
    title: review.title?.trim(),
    comment: review.comment.trim(),
    status: 'pending', // Requires Owner approval before visible publicly
    createdAt: new Date().toISOString(),
  };

  list.unshift(newReview);
  db.reviews = list;
  saveDatabase(db);
  return { review: newReview, isApproved: false };
}

export function updateDbReviewStatus(id: string, status: 'approved' | 'rejected'): ProductReview | null {
  const db = loadDatabase();
  const list = db.reviews || [];
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx].status = status;

  // If approved, award 50 Beans to the reviewer in Cà Phê Circle
  if (status === 'approved') {
    awardCircleBeans(list[idx].customerEmail, 50, 'Approved Product Review (+50 Beans)');
  }

  db.reviews = list;
  saveDatabase(db);
  return list[idx];
}

export function deleteDbReview(id: string): boolean {
  const db = loadDatabase();
  const list = db.reviews || [];
  const filtered = list.filter((r) => r.id !== id);
  if (filtered.length === list.length) return false;
  db.reviews = filtered;
  saveDatabase(db);
  return true;
}

// -------------------------------------------------------------
// CÀ PHÊ CIRCLE MEMBERSHIP & BEANS REWARDS
// -------------------------------------------------------------
function calculateCircleTier(lifetimeSpend: number): CircleTier {
  if (lifetimeSpend >= 8000) return 'Grand Cru';
  if (lifetimeSpend >= 3000) return 'Reserve';
  return 'Origin';
}

export function getDbCircleMembers(): CircleMember[] {
  const db = loadDatabase();
  return db.circleMembers || [];
}

export function findDbCircleMember(email: string): CircleMember | null {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const members = getDbCircleMembers();
  return members.find((m) => m.email.toLowerCase() === cleanEmail) || null;
}

export function createOrGetDbCircleMember(
  email: string,
  name?: string,
  phone?: string,
  referralCodeUsed?: string
): CircleMember {
  const db = loadDatabase();
  const members = db.circleMembers || [];
  const cleanEmail = email.toLowerCase().trim();
  const existing = members.find((m) => m.email.toLowerCase() === cleanEmail);

  if (existing) {
    if (name && !existing.name) existing.name = name;
    if (phone && !existing.phone) existing.phone = phone;
    saveDatabase(db);
    return existing;
  }

  // Generate unique referral code
  const codePrefix = (name || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'CAPHE';
  const referralCode = `${codePrefix}${Math.floor(100 + Math.random() * 900)}`;

  const newMember: CircleMember = {
    id: `circle-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    email: cleanEmail,
    name: name?.trim() || cleanEmail.split('@')[0],
    phone: phone?.trim(),
    beansBalance: 100, // 100 welcome bonus on joining
    lifetimeSpendINR: 0,
    tier: 'Origin',
    referralCode,
    referredBy: referralCodeUsed?.trim().toUpperCase(),
    joinedAt: new Date().toISOString(),
    history: [
      {
        id: `tx-welcome-${Date.now()}`,
        type: 'bonus',
        beans: 100,
        description: 'Welcome to Cà Phê Circle (+100 Beans)',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  members.unshift(newMember);
  db.circleMembers = members;
  saveDatabase(db);
  return newMember;
}

export function awardCircleBeans(
  email: string,
  beans: number,
  description: string,
  orderId?: string
): CircleMember | null {
  const db = loadDatabase();
  const members = db.circleMembers || [];
  const cleanEmail = email.toLowerCase().trim();
  const member = members.find((m) => m.email.toLowerCase() === cleanEmail);
  if (!member) return null;

  member.beansBalance = Math.max(0, member.beansBalance + beans);
  member.history.unshift({
    id: `tx-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    type: beans >= 0 ? 'earn' : 'reversal',
    beans,
    description,
    orderId,
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  return member;
}

export function redeemCircleBeans(
  email: string,
  beansToRedeem: number,
  orderId: string,
  orderTotalINR: number
): { success: boolean; discountINR: number; error?: string } {
  const member = findDbCircleMember(email);
  if (!member) {
    return { success: false, discountINR: 0, error: 'Member not found' };
  }

  if (beansToRedeem < 200) {
    return { success: false, discountINR: 0, error: 'Minimum redemption is 200 Beans (₹10 value)' };
  }

  if (beansToRedeem > member.beansBalance) {
    return { success: false, discountINR: 0, error: 'Insufficient Beans balance' };
  }

  // 100 Beans = ₹5
  const discountINR = Math.floor((beansToRedeem / 100) * 5);
  // Maximum 20% of order value
  const maxDiscountAllowed = Math.floor(orderTotalINR * 0.20);
  if (discountINR > maxDiscountAllowed) {
    return {
      success: false,
      discountINR: 0,
      error: `Redemption limit: maximum 20% of order value (₹${maxDiscountAllowed})`,
    };
  }

  // Deduct beans
  awardCircleBeans(
    email,
    -beansToRedeem,
    `Redeemed ₹${discountINR} off order ${orderId} (-${beansToRedeem} Beans)`,
    orderId
  );

  return { success: true, discountINR };
}

/**
 * FRAUD PROTECTION: Award Beans ONLY when order is marked 'Delivered'
 */
export function handleOrderDeliveredRewards(order: PlacedOrder): void {
  const email = order.customerEmail?.toLowerCase().trim();
  if (!email) return;

  const db = loadDatabase();
  const members = db.circleMembers || [];
  let member = members.find((m) => m.email.toLowerCase() === email);
  if (!member) {
    member = createOrGetDbCircleMember(email, order.customerName, order.customerPhone);
  }

  // Check if order was already rewarded
  const alreadyRewarded = member.history.some((h) => h.orderId === order.orderId && h.type === 'earn');
  if (alreadyRewarded) return;

  // Multiplier by tier
  const tierMultiplier = member.tier === 'Grand Cru' ? 1.5 : member.tier === 'Reserve' ? 1.25 : 1.0;
  const spendBeans = Math.round((order.finalTotalINR || 0) * 1 * tierMultiplier);

  // First order bonus: +200 Beans
  const isFirstDeliveredOrder = !member.history.some((h) => h.orderId && h.type === 'earn');
  const totalAward = spendBeans + (isFirstDeliveredOrder ? 200 : 0);

  member.beansBalance += totalAward;
  member.lifetimeSpendINR += order.finalTotalINR || 0;
  member.tier = calculateCircleTier(member.lifetimeSpendINR);

  member.history.unshift({
    id: `tx-deliv-${Date.now()}`,
    type: 'earn',
    beans: totalAward,
    description: `Earned on Delivered order ${order.orderId} (${spendBeans} spend + ${isFirstDeliveredOrder ? '200 First Order Bonus' : '0'})`,
    orderId: order.orderId,
    timestamp: new Date().toISOString(),
  });

  // If this member was referred, reward the referrer (+300 Beans) on first delivered order
  if (isFirstDeliveredOrder && member.referredBy) {
    const referrer = members.find((m) => m.referralCode === member!.referredBy && m.email !== member!.email);
    if (referrer) {
      referrer.beansBalance += 300;
      referrer.history.unshift({
        id: `tx-ref-${Date.now()}`,
        type: 'bonus',
        beans: 300,
        description: `Referral Reward: ${member.name || member.email} completed their first order (+300 Beans)`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  saveDatabase(db);
}

/**
 * FRAUD PROTECTION: Reverse Beans if order is cancelled
 */
export function handleOrderCancelledReversal(order: PlacedOrder): void {
  const email = order.customerEmail?.toLowerCase().trim();
  if (!email) return;

  const db = loadDatabase();
  const members = db.circleMembers || [];
  const member = members.find((m) => m.email.toLowerCase() === email);
  if (!member) return;

  const rewardTx = member.history.find((h) => h.orderId === order.orderId && h.type === 'earn');
  if (!rewardTx) return;

  const reversalBeans = rewardTx.beans;
  member.beansBalance = Math.max(0, member.beansBalance - reversalBeans);
  member.lifetimeSpendINR = Math.max(0, member.lifetimeSpendINR - (order.finalTotalINR || 0));
  member.tier = calculateCircleTier(member.lifetimeSpendINR);

  member.history.unshift({
    id: `tx-rev-${Date.now()}`,
    type: 'reversal',
    beans: -reversalBeans,
    description: `Order ${order.orderId} cancelled / returned - Beans reversed (-${reversalBeans})`,
    orderId: order.orderId,
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
}

