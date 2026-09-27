import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { ProductItem, PlacedOrder } from '../../src/types';
import { PRODUCT_ITEMS } from '../../src/data/coffeeData';

export type UserRole = 'owner' | 'staff';

export interface UserAccount {
  id: string;
  username: string; // unique username
  email: string; // unique email
  name: string; // display name
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

// Initial seed data: STRICTLY FRESH & EMPTY USERS
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
      isSetupComplete: false,
    },
    users: [], // Zero accounts — fresh setup
    sessions: [],
    otps: {},
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

export function loadDatabase(): StoreDatabase {
  if (dbCache) return dbCache;

  // 1. Try reading from TMP_DB_FILE
  const fromTmp = tryReadFile(TMP_DB_FILE);
  if (fromTmp) {
    dbCache = fromTmp;
    return dbCache;
  }

  // 2. Try reading from project DB_FILE
  const fromProject = tryReadFile(DB_FILE);
  if (fromProject) {
    dbCache = fromProject;
    return dbCache;
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
  const users = getDbUsers();
  return users.find((u) => u.id === id) || null;
}

export function findDbUserByIdentifier(identifier: string): UserAccount | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const users = getDbUsers();
  return (
    users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean
    ) || null
  );
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
export function getDbOrders(): PlacedOrder[] {
  const db = loadDatabase();
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
