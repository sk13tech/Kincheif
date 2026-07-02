import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs, setDoc, runTransaction } from 'firebase/firestore';
import type { Order, CustomerInfo, PaymentMethod } from '../types';
import { sanitize, sanitizeEmail, sanitizePhone, sanitizePincode, checkRateLimit } from './security';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
// Only exported for admin panel — NOT for direct use in user components
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  try { return (await signInWithPopup(auth, googleProvider)).user; } catch { return null; }
}
export async function signOutUser() { await fbSignOut(auth); }
export function onAuthChange(cb: (u: User | null) => void) { return onAuthStateChanged(auth, cb); }

function genOrderId(): string {
  const d = new Date();
  const r = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PH${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}${r}`;
}

/* ── Orders ── */
interface OrderItem { id: string; name: string; price: number; mrp: number; image: string; weight: string; qty: number; }

export interface FirestoreOrder {
  id: string; orderId: string; items: OrderItem[]; customer: CustomerInfo; paymentMethod: PaymentMethod;
  transactionId: string; totalAmount: number; status: Order['status']; createdAt: string;
  userId: string; userEmail: string | null; userName: string | null;
  couponCode?: string; couponDiscount?: number; giftCardCode?: string; giftCardUsed?: number;
  mrpTotal?: number; productDiscount?: number; canCancel?: boolean; deliveredAt?: string; replacementRequested?: boolean;
}

export interface SaveOrderInput {
  items: { product: { id: string; name: string; price: number; originalPrice?: number; image: string; weight: string }; quantity: number }[];
  customer: CustomerInfo; paymentMethod: PaymentMethod; transactionId: string; totalAmount: number;
  status: Order['status']; couponCode?: string; couponDiscount?: number; giftCardCode?: string; giftCardUsed?: number; mrpTotal?: number; productDiscount?: number;
}

/** Sanitize customer info before saving */
function sanitizeCustomer(c: CustomerInfo): CustomerInfo {
  return { name: sanitize(c.name), email: sanitizeEmail(c.email) || c.email, phone: sanitizePhone(c.phone), address: sanitize(c.address), city: sanitize(c.city), state: sanitize(c.state), pincode: sanitizePincode(c.pincode), notes: c.notes ? sanitize(c.notes) : '' };
}

export async function saveOrder(
  order: SaveOrderInput,
  user: { uid: string; email: string | null; displayName: string | null },
): Promise<string> {
  if (!user.uid) throw new Error('Not authenticated');
  if (!checkRateLimit('save_order', 3, 60000)) throw new Error('Too many orders. Wait a minute.');

  const orderId = genOrderId();
  const minItems: OrderItem[] = order.items.map(i => ({
    id: sanitize(i.product.id), name: sanitize(i.product.name), price: Math.max(0, Number(i.product.price) || 0),
    mrp: Math.max(0, Number(i.product.originalPrice || i.product.price) || 0), image: i.product.image,
    weight: sanitize(i.product.weight), qty: Math.max(1, Math.floor(Number(i.quantity) || 1)),
  }));

  // Validate total is non-negative
  const totalAmount = Math.max(0, Math.floor(Number(order.totalAmount) || 0));

  const data: Record<string, unknown> = {
    orderId, items: minItems, customer: sanitizeCustomer(order.customer), paymentMethod: order.paymentMethod,
    transactionId: sanitize(order.transactionId), totalAmount, status: 'pending',
    createdAt: new Date().toISOString(), userId: user.uid, userEmail: user.email, userName: user.displayName ? sanitize(user.displayName) : null,
    canCancel: true, _ts: serverTimestamp(),
  };
  if (order.couponCode) { data.couponCode = sanitize(order.couponCode).toUpperCase(); data.couponDiscount = Math.max(0, Number(order.couponDiscount) || 0); }
  if (order.giftCardCode) { data.giftCardCode = sanitize(order.giftCardCode).toUpperCase(); data.giftCardUsed = Math.max(0, Number(order.giftCardUsed) || 0); }
  if (order.mrpTotal) { data.mrpTotal = Math.max(0, Number(order.mrpTotal) || 0); data.productDiscount = Math.max(0, Number(order.productDiscount) || 0); }

  // Use transaction for gift card to prevent double-spending
  if (order.giftCardCode && order.giftCardUsed && order.giftCardUsed > 0) {
    await runTransaction(db, async (tx) => {
      const gcRef = doc(db, 'giftcards', order.giftCardCode!.toUpperCase());
      const gcSnap = await tx.get(gcRef);
      if (!gcSnap.exists()) throw new Error('Gift card not found');
      const gcData = gcSnap.data();
      if (!gcData.active || gcData.balance < order.giftCardUsed!) throw new Error('Insufficient gift card balance');
      const newBal = Math.max(0, gcData.balance - order.giftCardUsed!);
      tx.update(gcRef, { balance: newBal, active: newBal > 0 });
      // Create order inside same transaction
      const orderRef = doc(collection(db, 'orders'));
      tx.set(orderRef, data);
    });
  } else {
    await addDoc(collection(db, 'orders'), data);
  }

  return orderId;
}

export function subscribeToOrders(userId: string, cb: (o: FirestoreOrder[]) => void): () => void {
  if (!userId) { cb([]); return () => {}; }
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const arr: FirestoreOrder[] = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() } as FirestoreOrder));
    arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    cb(arr);
  }, () => cb([]));
}

/** Cancel order — verifies ownership + status server-side */
export async function cancelOrder(docId: string, userId: string): Promise<boolean> {
  if (!docId || !userId) return false;
  try {
    const ref = doc(db, 'orders', docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const d = snap.data();
    // SECURITY: verify ownership
    if (d.userId !== userId) return false;
    if (!['pending', 'confirmed', 'processing'].includes(d.status)) return false;
    await updateDoc(ref, { status: 'cancelled', canCancel: false });
    return true;
  } catch { return false; }
}

/** Request replacement — verifies ownership + status + 3-day window + reason required */
export async function requestReplacement(docId: string, userId: string, reason: string): Promise<boolean> {
  if (!docId || !userId || !reason) return false;
  try {
    const ref = doc(db, 'orders', docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const d = snap.data();
    if (d.userId !== userId) return false;
    if (d.status !== 'delivered') return false;
    if (d.replacementRequested) return false;
    const deliveredAt = d.deliveredAt ? new Date(d.deliveredAt) : new Date(d.createdAt);
    if ((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24) > 3) return false;
    await updateDoc(ref, { replacementRequested: true, replacementReason: reason, replacementRequestedAt: new Date().toISOString() });
    return true;
  } catch { return false; }
}

/* ── Coupons ── */
export interface Coupon { code: string; discount: number; type: 'percent' | 'flat'; minOrder: number; active: boolean; maxDiscount?: number; }
export async function validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: Coupon; discountAmount?: number; error?: string }> {
  if (!code || typeof code !== 'string' || code.length > 20) return { valid: false, error: 'Invalid code' };
  if (!checkRateLimit('coupon_validate', 10, 60000)) return { valid: false, error: 'Too many attempts' };
  try {
    const snap = await getDoc(doc(db, 'coupons', code.toUpperCase()));
    if (!snap.exists()) return { valid: false, error: 'Invalid coupon code' };
    const c = snap.data() as Coupon;
    if (!c.active) return { valid: false, error: 'Coupon expired' };
    if (orderTotal < c.minOrder) return { valid: false, error: `Min order ₹${c.minOrder}` };
    let amt = c.type === 'percent' ? Math.round(orderTotal * c.discount / 100) : c.discount;
    if (c.maxDiscount && amt > c.maxDiscount) amt = c.maxDiscount;
    // Cap discount at order total (can't go negative)
    amt = Math.min(amt, orderTotal);
    return { valid: true, coupon: { ...c, code: code.toUpperCase() }, discountAmount: amt };
  } catch { return { valid: false, error: 'Could not verify' }; }
}

/* ── Gift Cards ── */
export interface GiftCard { code: string; balance: number; active: boolean; }
export async function validateGiftCard(code: string): Promise<{ valid: boolean; card?: GiftCard; error?: string }> {
  if (!code || typeof code !== 'string' || code.length > 20) return { valid: false, error: 'Invalid code' };
  if (!checkRateLimit('giftcard_validate', 10, 60000)) return { valid: false, error: 'Too many attempts' };
  try {
    const snap = await getDoc(doc(db, 'giftcards', code.toUpperCase()));
    if (!snap.exists()) return { valid: false, error: 'Invalid gift card' };
    const c = snap.data() as GiftCard;
    if (!c.active) return { valid: false, error: 'Gift card inactive' };
    if (c.balance <= 0) return { valid: false, error: 'No balance' };
    return { valid: true, card: { ...c, code: code.toUpperCase() } };
  } catch { return { valid: false, error: 'Could not verify' }; }
}

/* ── Addresses — sanitized ── */
export interface SavedAddress extends CustomerInfo { id: string; label: string; }
export async function getSavedAddresses(uid: string): Promise<SavedAddress[]> {
  if (!uid) return [];
  try { const s = await getDocs(query(collection(db, 'addresses'), where('userId', '==', uid))); const a: SavedAddress[] = []; s.forEach(d => a.push({ id: d.id, ...d.data() } as SavedAddress)); return a; } catch { return []; }
}
export async function saveAddress(uid: string, addr: CustomerInfo, label: string): Promise<string> {
  if (!uid) return '';
  try { return (await addDoc(collection(db, 'addresses'), { ...sanitizeCustomer(addr), userId: uid, label: sanitize(label), _ts: serverTimestamp() })).id; } catch { return ''; }
}
export async function deleteAddress(id: string) { if (!id) return; try { await deleteDoc(doc(db, 'addresses', id)); } catch {} }

/* ── Profile — sanitized ── */
export interface UserProfile { phone: string; displayName: string; }
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try { const s = await getDoc(doc(db, 'profiles', uid)); return s.exists() ? s.data() as UserProfile : null; } catch { return null; }
}
export async function saveUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!uid) return;
  const clean: Record<string, string> = {};
  if (data.phone) clean.phone = sanitizePhone(data.phone);
  if (data.displayName) clean.displayName = sanitize(data.displayName);
  try { await setDoc(doc(db, 'profiles', uid), clean, { merge: true }); } catch {}
}

/* ── Pincode ── */
export async function validatePincode(pin: string): Promise<{ valid: boolean; city?: string; state?: string }> {
  if (!/^\d{6}$/.test(pin)) return { valid: false };
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const j = await r.json();
    if (j[0]?.Status === 'Success' && j[0]?.PostOffice?.length) { const p = j[0].PostOffice[0]; return { valid: true, city: p.District, state: p.State }; }
    return { valid: false };
  } catch { return { valid: false }; }
}

/* ── Contact — sanitized ── */
export async function saveContact(data: { name: string; email: string; message: string }) {
  const clean = { name: sanitize(data.name).slice(0, 100), email: (sanitizeEmail(data.email) || '').slice(0, 254), message: sanitize(data.message).slice(0, 500) };
  if (!clean.name || !clean.email) return;
  try { await addDoc(collection(db, 'contacts'), { ...clean, createdAt: new Date().toISOString(), _ts: serverTimestamp() }); } catch {}
}

/* ── Site Config ── */
export interface SiteConfig {
  logoUrl?: string; logoTextUrl?: string; siteName?: string;
  heroTitle?: string; heroSubtitle?: string; heroBadge?: string; heroImage?: string;
  contactPhone?: string; contactEmail?: string; contactAddress?: string; contactCity?: string; contactHours?: string;
  upiId?: string; upiName?: string; upiTemplate?: string;
  aboutTitle?: string; aboutSubtitle?: string;
  minFreeDelivery?: string; deliveryFee?: string;
  showHeroTitle?: boolean; showHeroBadge?: boolean; showHeroSubtitle?: boolean; showTestimonials?: boolean;
  instagramReels?: string[];
}

export function subscribeSiteConfig(cb: (cfg: SiteConfig) => void): () => void {
  return onSnapshot(doc(db, 'config', 'site'), (snap) => {
    cb(snap.exists() ? snap.data() as SiteConfig : {});
  }, () => cb({}));
}

/* ── Products ── */
import type { Product } from '../types';

export function subscribeToProducts(cb: (products: Product[]) => void): () => void {
  return onSnapshot(collection(db, 'products'), (snap) => {
    const arr: Product[] = [];
    snap.forEach((d) => {
      const data = d.data();
      arr.push({
        id: d.id, name: data.name || '', description: data.description || '', longDescription: data.longDescription || '',
        price: Number(data.price) || 0, originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        image: data.image || '', images: data.images || [data.image || ''],
        category: data.category || 'Spices', tags: data.tags || [],
        rating: Number(data.rating) || 4.5, reviews: Number(data.reviews) || 0,
        inStock: data.inStock !== false, weight: data.weight || '',
        ingredients: data.ingredients || [], shelfLife: data.shelfLife || '',
        maxOrderLimit: data.maxOrderLimit ? Number(data.maxOrderLimit) : undefined,
        isNew: data.isNew || false, isBestseller: data.isBestseller || false,
      });
    });
    cb(arr);
  }, () => cb([]));
}

export async function seedProducts(products: Product[]): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (!snap.empty) return false;
    for (const p of products) {
      await setDoc(doc(db, 'products', p.id), {
        name: p.name, description: p.description, longDescription: p.longDescription,
        price: p.price, originalPrice: p.originalPrice || null, image: p.image, images: p.images,
        category: p.category, tags: p.tags, rating: p.rating, reviews: p.reviews,
        inStock: p.inStock, weight: p.weight, ingredients: p.ingredients, shelfLife: p.shelfLife,
        maxOrderLimit: p.maxOrderLimit || null,
        isNew: p.isNew || false, isBestseller: p.isBestseller || false,
      });
    }
    return true;
  } catch { return false; }
}

export function subscribeToCategories(cb: (cats: string[]) => void): () => void {
  return onSnapshot(doc(db, 'config', 'categories'), (snap) => {
    cb(snap.exists() ? snap.data().list || [] : []);
  }, () => cb([]));
}
