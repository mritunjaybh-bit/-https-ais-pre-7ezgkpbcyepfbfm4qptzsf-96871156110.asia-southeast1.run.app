import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { ProductItem, PlacedOrder } from '../src/types';
import { PRODUCT_ITEMS } from '../src/data/coffeeData';

export interface AdminConfig {
  username: string; // Owner ID
  email: string; // Registered owner email
  passwordHash?: string; // salt:scrypt_hex
  password?: string; // legacy fallback (cleared once setup)
  isSetupComplete: boolean;
  setupAt?: string;
  lastLoginAt?: string;
}

export interface OtpRecord {
  otp: string;
  email: string;
  expiresAt: number;
}

export interface StoreDatabase {
  products: ProductItem[];
  orders: PlacedOrder[];
  adminConfig: AdminConfig;
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
      // Direct comparison if legacy plain text
      return password === storedHash;
    }
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return computedHash === originalHash;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Initial seed data
export function getInitialSeedData(): StoreDatabase {
  // Ensure every product has stockQuantity and isActive
  const seededProducts: ProductItem[] = PRODUCT_ITEMS.map((p, idx) => ({
    ...p,
    stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 45 + (idx % 5) * 10,
    isActive: p.isActive !== undefined ? p.isActive : true,
  }));

  const seededOrders: PlacedOrder[] = [];

  const defaultAdmin: AdminConfig = {
    username: 'owner',
    email: 'mritunjaybh@gmail.com',
    isSetupComplete: false,
    passwordHash: '',
  };

  return {
    products: seededProducts,
    orders: seededOrders,
    adminConfig: defaultAdmin,
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

  // 1. Try reading from TMP_DB_FILE (persists across warm serverless invocations)
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
    // In-memory cache still holds current state
    if (!wroteToProject) {
      console.warn('[Database] Could not write to disk, using in-memory store:', err);
    }
  }
}

// Helper accessors
export function getDbProducts(): ProductItem[] {
  const db = loadDatabase();
  return db.products;
}

export function updateDbProducts(products: ProductItem[]): void {
  const db = loadDatabase();
  db.products = products;
  saveDatabase(db);
}

export function getDbOrders(): PlacedOrder[] {
  const db = loadDatabase();
  return db.orders || [];
}

export function updateDbOrders(orders: PlacedOrder[]): void {
  const db = loadDatabase();
  db.orders = orders;
  saveDatabase(db);
}

export function getDbAdminConfig(): AdminConfig {
  const db = loadDatabase();
  if (!db.adminConfig) {
    db.adminConfig = {
      username: 'owner',
      email: 'mritunjaybh@gmail.com',
      isSetupComplete: false,
      passwordHash: '',
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

export function updateDbAdminPassword(newPasswordPlain: string): void {
  const hashed = hashPassword(newPasswordPlain);
  updateDbAdminConfig({
    passwordHash: hashed,
    password: undefined, // remove any plaintext
  });
}
