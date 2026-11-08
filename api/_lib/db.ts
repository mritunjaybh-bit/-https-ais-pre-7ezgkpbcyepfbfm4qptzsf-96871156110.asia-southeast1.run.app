import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
  getFirestore as initFirestore,
  FieldValue,
  type Firestore,
  type Query,
} from 'firebase-admin/firestore';
import type {
  ProductItem,
  PlacedOrder,
  EmailSubscriber,
  SiteSettings,
  PreOrderRecord,
  ProductReview,
  CircleMember,
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

// -------------------------------------------------------------
// SECURE PASSWORD HASHING & TIMING-SAFE VERIFICATION
// -------------------------------------------------------------
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
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// DATABASE NOT CONFIGURED ERROR
// -------------------------------------------------------------
export class DatabaseNotConfiguredError extends Error {
  constructor(message = 'database not configured') {
    super(message);
    this.name = 'DatabaseNotConfiguredError';
  }
}

// -------------------------------------------------------------
// FIREBASE ADMIN INITIALIZATION (SERVER-SIDE ONLY)
// -------------------------------------------------------------
let firestoreDb: Firestore | null = null;

function formatPrivateKey(rawKey?: string): string {
  if (!rawKey) return '';
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n').trim();
}

export function isFirestoreConfigured(): boolean {
  const projectId = (process.env.FIREBASE_PROJECT_ID || '').trim().replace(/^["']|["']$/g, '');
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim().replace(/^["']|["']$/g, '');
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    projectId.toLowerCase().includes('placeholder') ||
    clientEmail.toLowerCase().includes('placeholder') ||
    projectId.toLowerCase().includes('example') ||
    clientEmail.toLowerCase().includes('example') ||
    privateKey.toLowerCase().includes('placeholder')
  ) {
    return false;
  }
  return true;
}

export function getFirestore(): Firestore {
  if (firestoreDb) return firestoreDb;

  if (!isFirestoreConfigured()) {
    throw new DatabaseNotConfiguredError('database not configured');
  }

  const projectId = (process.env.FIREBASE_PROJECT_ID || '').trim().replace(/^["']|["']$/g, '');
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim().replace(/^["']|["']$/g, '');
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    firestoreDb = initFirestore();
    return firestoreDb;
  } catch (err: any) {
    // Never log any part of the credentials
    console.error('[Firebase Admin Error]: database not configured or connection failed');
    throw new DatabaseNotConfiguredError('database not configured');
  }
}

// -------------------------------------------------------------
// OWNER-ONLY HEALTH CHECK (WRITE & READ TEST DOCUMENT)
// -------------------------------------------------------------
export async function checkFirestoreHealth(): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  error?: string;
}> {
  let db: Firestore;
  try {
    db = getFirestore();
  } catch (e: any) {
    return {
      success: false,
      message: 'Firestore health check failed: database not configured',
      error: 'database not configured',
    };
  }

  const startTime = Date.now();
  const testDocId = `health-probe-${Date.now()}`;
  const testDocRef = db.collection('_health_test').doc(testDocId);

  try {
    // 1. Write probe doc
    await testDocRef.set({
      probe: true,
      timestamp: FieldValue.serverTimestamp(),
      clientTime: new Date().toISOString(),
    });

    // 2. Read probe doc
    const snap = await testDocRef.get();
    if (!snap.exists) {
      throw new Error('Test probe document written but could not be read back');
    }

    // 3. Clean up probe doc
    await testDocRef.delete();

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: 'Firestore read/write test verified successfully',
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Firestore read/write operation failed',
      error: err?.message || 'database operation failed',
    };
  }
}

// -------------------------------------------------------------
// SITE SETTINGS
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
  publicContactEmail: 'mritunjay.bhardwaj@caphevietnam.in',
  metaPixelId: '',
  footerLegalLine: 'Cà Phê is a brand of SuleVina Global Ventures (OPC) Private Limited (incorporation in progress).',
  showPartnerAddressPublicly: false,
  partnerAddress: '',
};

export async function getDbSiteSettings(): Promise<SiteSettings> {
  const db = getFirestore();
  const docRef = db.collection('siteSettings').doc('current');
  const snap = await docRef.get();

  if (!snap.exists) {
    await docRef.set(DEFAULT_SITE_SETTINGS);
    return DEFAULT_SITE_SETTINGS;
  }

  const data = snap.data() as Partial<SiteSettings>;
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...data,
  };
}

export async function updateDbSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = getFirestore();
  const current = await getDbSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...partial,
  };
  await db.collection('siteSettings').doc('current').set(updated, { merge: true });
  return updated;
}

// -------------------------------------------------------------
// PRODUCTS (SEEDED FROM STATIC DATA ONLY IF COLLECTION EMPTY)
// -------------------------------------------------------------
export async function getDbProducts(): Promise<ProductItem[]> {
  const db = getFirestore();
  const snap = await db.collection('products').get();

  if (snap.empty) {
    const batch = db.batch();
    const seeded: ProductItem[] = PRODUCT_ITEMS.map((p, idx) => ({
      ...p,
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 45 + (idx % 5) * 10,
      isActive: p.isActive !== undefined ? p.isActive : true,
    }));

    for (const prod of seeded) {
      const docRef = db.collection('products').doc(prod.id);
      batch.set(docRef, prod);
    }
    await batch.commit();
    return seeded;
  }

  return snap.docs.map((d) => d.data() as ProductItem);
}

export async function updateDbProducts(products: ProductItem[]): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  for (const prod of products) {
    const docRef = db.collection('products').doc(prod.id);
    batch.set(docRef, prod, { merge: true });
  }
  await batch.commit();
}

// -------------------------------------------------------------
// ADMIN USERS & OWNER SETUP
// -------------------------------------------------------------
export async function getDbUsers(): Promise<UserAccount[]> {
  const db = getFirestore();
  const snap = await db.collection('adminUsers').get();
  return snap.docs.map((d) => d.data() as UserAccount);
}

export async function findDbUserById(id: string): Promise<UserAccount | null> {
  const db = getFirestore();
  const doc = await db.collection('adminUsers').doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as UserAccount;
}

export async function findDbUserByIdentifier(identifier: string): Promise<UserAccount | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const db = getFirestore();

  const snapUser = await db.collection('adminUsers').where('username', '==', clean).limit(1).get();
  if (!snapUser.empty) {
    return snapUser.docs[0].data() as UserAccount;
  }

  const snapEmail = await db.collection('adminUsers').where('email', '==', clean).limit(1).get();
  if (!snapEmail.empty) {
    return snapEmail.docs[0].data() as UserAccount;
  }

  return null;
}

export async function findDbUserByRecovery(detail: string): Promise<{ user: UserAccount; matchReason: string } | null> {
  if (!detail) return null;
  const clean = detail.trim().toLowerCase();
  const cleanPhone = detail.replace(/[^0-9]/g, '');
  const users = await getDbUsers();

  for (const user of users) {
    if (user.status === 'deactivated') continue;
    if (user.email.toLowerCase() === clean) {
      return { user, matchReason: 'email' };
    }
    if (user.username.toLowerCase() === clean) {
      return { user, matchReason: 'username' };
    }
    if (user.phone && cleanPhone.length >= 10 && user.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10))) {
      return { user, matchReason: 'phone' };
    }
  }
  return null;
}

export async function createDbUser(userData: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount> {
  const db = getFirestore();
  const newUser: UserAccount = {
    ...userData,
    id: `usr-${userData.role}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
  };

  await db.collection('adminUsers').doc(newUser.id).set(newUser);
  return newUser;
}

export async function updateDbUser(id: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
  const db = getFirestore();
  const docRef = db.collection('adminUsers').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const current = snap.data() as UserAccount;
  const updated: UserAccount = {
    ...current,
    ...updates,
  };
  await docRef.set(updated, { merge: true });
  return updated;
}

export async function deleteDbUser(id: string): Promise<boolean> {
  const db = getFirestore();
  await db.collection('adminUsers').doc(id).delete();
  return true;
}

export async function getDbAdminConfig(): Promise<AdminConfig> {
  const users = await getDbUsers();
  const hasOwner = users.some((u) => u.role === 'owner' && u.status === 'active');
  return {
    isSetupComplete: hasOwner,
    setupAt: users[0]?.createdAt,
  };
}

export async function updateDbAdminConfig(updates: Partial<AdminConfig>): Promise<AdminConfig> {
  const config = await getDbAdminConfig();
  return { ...config, ...updates };
}

export async function resetDatabaseAuth(): Promise<void> {
  const db = getFirestore();
  const userSnaps = await db.collection('adminUsers').get();
  const batch = db.batch();
  userSnaps.docs.forEach((doc) => batch.delete(doc.ref));

  const otpSnaps = await db.collection('adminOtps').get();
  otpSnaps.docs.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
}

// -------------------------------------------------------------
// SESSIONS (TOKEN-BASED WITH EPHEMERAL SET)
// -------------------------------------------------------------
const activeSessionsSet = new Set<string>();

export function getDbSessions(): string[] {
  return Array.from(activeSessionsSet);
}

export function addDbSession(token: string): void {
  activeSessionsSet.add(token);
}

export function removeDbSession(token: string): void {
  activeSessionsSet.delete(token);
}

export function clearDbSessions(): void {
  activeSessionsSet.clear();
}

// -------------------------------------------------------------
// ADMIN OTPS (EXPIRES IN 10 MINUTES)
// -------------------------------------------------------------
export async function saveDbOtp(resetToken: string, record: OtpRecord): Promise<void> {
  const db = getFirestore();
  await db.collection('adminOtps').doc(resetToken).set(record);
}

export async function getDbOtp(resetToken: string): Promise<OtpRecord | null> {
  const db = getFirestore();
  const snap = await db.collection('adminOtps').doc(resetToken).get();
  if (!snap.exists) return null;

  const data = snap.data() as OtpRecord;
  if (data.expiresAt && data.expiresAt < Date.now()) {
    await db.collection('adminOtps').doc(resetToken).delete();
    return null;
  }
  return data;
}

export async function deleteDbOtp(resetToken: string): Promise<void> {
  const db = getFirestore();
  await db.collection('adminOtps').doc(resetToken).delete();
}

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------
export async function getDbOrders(_forceReload = true): Promise<PlacedOrder[]> {
  const db = getFirestore();
  const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as PlacedOrder);
}

export async function updateDbOrders(orders: PlacedOrder[]): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  for (const order of orders) {
    const docId = String(order.orderId);
    const docRef = db.collection('orders').doc(docId);
    batch.set(docRef, order, { merge: true });
  }
  await batch.commit();
}

export async function saveDbOrder(order: PlacedOrder): Promise<PlacedOrder> {
  const db = getFirestore();
  await db.collection('orders').doc(String(order.orderId)).set(order, { merge: true });
  return order;
}

// -------------------------------------------------------------
// SUBSCRIBERS / WAITLIST (DUPLICATE-PROTECTED)
// -------------------------------------------------------------
export async function getDbSubscribers(): Promise<EmailSubscriber[]> {
  const db = getFirestore();
  const snap = await db.collection('subscribers').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as EmailSubscriber);
}

export async function addDbSubscriber(subscriber: {
  email: string;
  source?: string;
  discountCode?: string;
  phone?: string;
  interest?: string;
  consent?: boolean;
}): Promise<{ subscriber: EmailSubscriber; isNew: boolean }> {
  const cleanEmail = subscriber.email.trim().toLowerCase();
  const db = getFirestore();

  const snap = await db
    .collection('subscribers')
    .where('email', '==', cleanEmail)
    .limit(1)
    .get();

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    const existingData = existingDoc.data() as EmailSubscriber;

    const updated: EmailSubscriber = {
      ...existingData,
      phone: subscriber.phone !== undefined ? subscriber.phone : existingData.phone,
      interest: subscriber.interest !== undefined ? subscriber.interest : existingData.interest,
      consent: subscriber.consent !== undefined ? subscriber.consent : existingData.consent,
    };

    await existingDoc.ref.set(updated, { merge: true });
    return { subscriber: updated, isNew: false };
  }

  const newSub: EmailSubscriber = {
    id: `sub-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    email: cleanEmail,
    createdAt: new Date().toISOString(),
    source: subscriber.source || 'waitlist',
    discountCode: subscriber.discountCode || 'XINCHAO10',
    phone: subscriber.phone || undefined,
    interest: subscriber.interest || undefined,
    consent: subscriber.consent !== undefined ? subscriber.consent : false,
  };

  await db.collection('subscribers').doc(newSub.id).set(newSub);
  return { subscriber: newSub, isNew: true };
}

// -------------------------------------------------------------
// PRE-ORDERS & WAITLIST RESERVATIONS
// -------------------------------------------------------------
export async function getDbPreOrders(): Promise<PreOrderRecord[]> {
  const db = getFirestore();
  const snap = await db.collection('preOrders').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as PreOrderRecord);
}

export async function createDbPreOrder(data: {
  customerName: string;
  customerContact: string;
  productId: string;
  productName: string;
  quantity?: number;
  notes?: string;
}): Promise<PreOrderRecord> {
  const db = getFirestore();
  const newRecord: PreOrderRecord = {
    id: `pre-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    customerName: data.customerName.trim(),
    customerContact: data.customerContact.trim(),
    productId: data.productId,
    productName: data.productName,
    quantity: data.quantity || 1,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: data.notes?.trim(),
  };

  await db.collection('preOrders').doc(newRecord.id).set(newRecord);
  return newRecord;
}

export async function updateDbPreOrderStatus(
  id: string,
  status: PreOrderRecord['status']
): Promise<PreOrderRecord | null> {
  const db = getFirestore();
  const docRef = db.collection('preOrders').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  await docRef.update({ status });
  const updatedSnap = await docRef.get();
  return updatedSnap.data() as PreOrderRecord;
}

// -------------------------------------------------------------
// PRODUCT REVIEWS
// -------------------------------------------------------------
export async function getDbReviews(includeAll = false): Promise<ProductReview[]> {
  const db = getFirestore();
  let query: Query = db.collection('reviews');
  if (!includeAll) {
    query = query.where('status', '==', 'approved');
  }
  const snap = await query.get();
  return snap.docs.map((d) => d.data() as ProductReview);
}

export async function createDbReview(data: {
  productId: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
}): Promise<{ success: boolean; review: ProductReview }> {
  const db = getFirestore();
  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    productId: data.productId,
    orderId: data.orderId,
    customerEmail: data.customerEmail.toLowerCase().trim(),
    customerName: data.customerName.trim(),
    rating: Math.max(1, Math.min(5, data.rating)),
    title: data.title?.trim(),
    comment: data.comment.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await db.collection('reviews').doc(newReview.id).set(newReview);
  return { success: true, review: newReview };
}

export async function updateDbReviewStatus(
  id: string,
  status: ProductReview['status']
): Promise<ProductReview | null> {
  const db = getFirestore();
  const docRef = db.collection('reviews').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  await docRef.update({ status });
  const updatedSnap = await docRef.get();
  return updatedSnap.data() as ProductReview;
}

export async function deleteDbReview(id: string): Promise<boolean> {
  const db = getFirestore();
  await db.collection('reviews').doc(id).delete();
  return true;
}

// -------------------------------------------------------------
// CÀ PHÊ CIRCLE MEMBERSHIP (DISABLED - OPENS AT LAUNCH)
// -------------------------------------------------------------
export function getDbCircleMembers(): CircleMember[] {
  return [];
}

export async function findDbCircleMember(): Promise<null> {
  return null;
}

export async function createOrGetDbCircleMember(): Promise<{ notice: string }> {
  return { notice: 'Circle opens at launch' };
}

export async function awardCircleBeans(): Promise<{ success: boolean; error: string }> {
  return { success: false, error: 'Circle opens at launch' };
}

export async function redeemCircleBeans(): Promise<{ success: boolean; error: string }> {
  return { success: false, error: 'Circle opens at launch' };
}

export async function handleOrderDeliveredRewards(_order?: any): Promise<void> {}

export async function handleOrderCancelledReversal(_order?: any): Promise<void> {}
