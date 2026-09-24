import fs from 'fs';
import path from 'path';
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

export interface StoreDatabase {
  products: ProductItem[];
  orders: PlacedOrder[];
  adminConfig: AdminConfig;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

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
function getInitialSeedData(): StoreDatabase {
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

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDatabase(): StoreDatabase {
  if (dbCache) return dbCache;

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        dbCache = parsed;
        return dbCache as StoreDatabase;
      }
    } catch (err) {
      console.error('[Database] Failed to read existing store.json, re-seeding:', err);
    }
  }

  // Seed fresh database
  const initial = getInitialSeedData();
  dbCache = initial;
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(data: StoreDatabase): void {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    dbCache = data;
  } catch (err) {
    console.error('[Database] Failed to write store.json:', err);
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
