// ============================================================
// DATA LAYER — Firebase Firestore (primary) + localStorage (cache)
// ============================================================
import { db, auth } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { Product, CartItem, Customer, Address, Order, OrderStatus, PaymentStatus, StoreSettings, Coupon } from './types';

// ============================================================
// DEFAULTS
// ============================================================
// No default products — admin adds products via dashboard

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'CrispyRoots', tagline: 'Homemade Organic Potato Chips',
  description: 'Handcrafted with love using organic potatoes and cold-pressed oils. No preservatives, no artificial flavors — just pure, crispy goodness.',
  logoUrl: '', phone: '+91 98765 43210', email: 'hello@crispyroots.in',
  address: '42, Organic Lane, Koramangala', city: 'Bangalore, Karnataka 560034',
  upiId: 'crispyroots@upi', upiName: 'CrispyRoots Foods',
  minFreeDelivery: 499, deliveryFee: 49,
  socialLinks: { instagram: '', facebook: '', whatsapp: '' }, announcement: ''
};

// ============================================================
// CACHE — safe localStorage wrapper
// ============================================================
function cacheGet<T>(key: string): T | null {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch { return null; }
}
function cacheSet(key: string, data: any) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

// ============================================================
// SYNC LOCK — prevents race conditions
// ============================================================
let _syncInProgress = false;

// ============================================================
// PRODUCTS
// ============================================================
let _products: Product[] | null = null;

export function getProducts(): Product[] {
  if (_products) return [..._products];
  const c = cacheGet<Product[]>('cr_products');
  if (c && c.length > 0) { _products = c; return [...c]; }
  _products = [];
  syncProductsFromFirestore();
  return [];
}
export async function syncProductsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    const p = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    if (p.length > 0) { _products = p; cacheSet('cr_products', p); }
  } catch { /* offline */ }
}
export function getProduct(id: string) { return getProducts().find(p => p.id === id); }
export function saveProducts(p: Product[]) { _products = p; cacheSet('cr_products', p); }
export async function addProduct(p: Product) { const a = getProducts(); a.push(p); saveProducts(a); try { await setDoc(doc(db, 'products', p.id), p); } catch {} }
export async function updateProduct(p: Product) { const a = getProducts(); const i = a.findIndex(x => x.id === p.id); if (i >= 0) { a[i] = p; saveProducts(a); } try { await setDoc(doc(db, 'products', p.id), p); } catch {} }
export async function deleteProduct(id: string) { saveProducts(getProducts().filter(p => p.id !== id)); try { await deleteDoc(doc(db, 'products', id)); } catch {} }

// ============================================================
// CART — localStorage only
// ============================================================
export function getCart(): CartItem[] { return cacheGet<CartItem[]>('cr_cart') || []; }
export function saveCart(c: CartItem[]) { cacheSet('cr_cart', c); }
export function addToCart(product: Product, qty = 1) { const c = getCart(); const i = c.findIndex(x => x.product.id === product.id); if (i >= 0) c[i].quantity += qty; else c.push({ product, quantity: qty }); saveCart(c); }
export function updateCartQuantity(pid: string, qty: number) { let c = getCart(); if (qty <= 0) c = c.filter(x => x.product.id !== pid); else { const i = c.findIndex(x => x.product.id === pid); if (i >= 0) c[i].quantity = qty; } saveCart(c); }
export function removeFromCart(pid: string) { saveCart(getCart().filter(c => c.product.id !== pid)); }
export function clearCart() { localStorage.removeItem('cr_cart'); }
export function getCartTotal() { const c = getCart(); const sub = c.reduce((s, x) => s + x.product.price * x.quantity, 0); const sav = c.reduce((s, x) => s + ((x.product.originalPrice || x.product.price) - x.product.price) * x.quantity, 0); const fee = getDeliveryFee(sub); return { subtotal: sub, savings: sav, deliveryFee: fee, total: sub + fee, itemCount: c.reduce((s, x) => s + x.quantity, 0) }; }

// ============================================================
// CUSTOMERS
// ============================================================
let _customers: Customer[] | null = null;

export function getCurrentCustomer(): Customer | null { return cacheGet<Customer>('cr_current_customer'); }
export function setCurrentCustomer(c: Customer) { cacheSet('cr_current_customer', c); }
export function getCustomers(): Customer[] {
  if (_customers) return [..._customers];
  const c = cacheGet<Customer[]>('cr_customers');
  _customers = c || [];
  return [..._customers];
}
export async function syncCustomersFromFirestore() {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    const c = snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
    _customers = c;
    cacheSet('cr_customers', c);
  } catch { /* offline */ }
}
export function getCustomerByPhone(phone: string) { return getCustomers().find(c => c.phone === phone); }
export async function createCustomer(c: Customer) {
  if (!_customers) _customers = [];
  _customers.push(c); cacheSet('cr_customers', _customers); setCurrentCustomer(c);
  try { await setDoc(doc(db, 'customers', c.id), c); } catch {}
}
export async function updateCustomer(c: Customer) {
  if (!_customers) _customers = [];
  const i = _customers.findIndex(x => x.id === c.id);
  if (i >= 0) _customers[i] = c; else _customers.push(c);
  cacheSet('cr_customers', _customers); setCurrentCustomer(c);
  try { await setDoc(doc(db, 'customers', c.id), c); } catch {}
}
export async function addCustomerAddress(cid: string, addr: Address) {
  // Get or create customer in the live array
  if (!_customers) _customers = [];
  let c = _customers.find(x => x.id === cid);
  // If not in memory, try getCurrentCustomer
  if (!c) { const cur = getCurrentCustomer(); if (cur && cur.id === cid) { c = cur; _customers.push(c); } }
  if (!c) return;
  if (!c.addresses) c.addresses = [];
  if (addr.isDefault) c.addresses.forEach(a => a.isDefault = false);
  c.addresses.push(addr);
  cacheSet('cr_customers', _customers);
  setCurrentCustomer({...c}); // force fresh copy to localStorage
  try { await setDoc(doc(db, 'customers', c.id), c); } catch {}
}
export async function updateCustomerAddress(cid: string, addr: Address) {
  if (!_customers) _customers = [];
  let c = _customers.find(x => x.id === cid);
  if (!c) { const cur = getCurrentCustomer(); if (cur && cur.id === cid) { c = cur; _customers.push(c); } }
  if (!c) return;
  if (!c.addresses) c.addresses = [];
  if (addr.isDefault) c.addresses.forEach(a => a.isDefault = false);
  const i = c.addresses.findIndex(a => a.id === addr.id); if (i >= 0) c.addresses[i] = addr;
  cacheSet('cr_customers', _customers);
  setCurrentCustomer({...c});
  try { await setDoc(doc(db, 'customers', c.id), c); } catch {}
}
export async function deleteCustomerAddress(cid: string, aid: string) {
  if (!_customers) _customers = [];
  let c = _customers.find(x => x.id === cid);
  if (!c) { const cur = getCurrentCustomer(); if (cur && cur.id === cid) { c = cur; _customers.push(c); } }
  if (!c) return;
  c.addresses = (c.addresses || []).filter(a => a.id !== aid);
  cacheSet('cr_customers', _customers);
  setCurrentCustomer({...c});
  try { await setDoc(doc(db, 'customers', c.id), c); } catch {}
}
export function customerLogout() { localStorage.removeItem('cr_current_customer'); signOut(auth).catch(() => {}); }
export async function deleteCustomerAccount(cid: string) {
  if (_customers) _customers = _customers.filter(c => c.id !== cid);
  cacheSet('cr_customers', _customers || []);
  localStorage.removeItem('cr_current_customer');
  try { await deleteDoc(doc(db, 'customers', cid)); } catch {}
  signOut(auth).catch(() => {});
}
export async function searchCustomers(query: string): Promise<Customer[]> {
  const needle = query.toLowerCase().trim();
  if (!needle) return [];
  const match = (c: Customer) =>
    (c.email && c.email.toLowerCase().includes(needle)) ||
    (c.phone && c.phone.includes(needle)) ||
    (c.name && c.name.toLowerCase().includes(needle));
  try {
    const snap = await getDocs(collection(db, 'customers'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
    _customers = all; cacheSet('cr_customers', all);
    return all.filter(match);
  } catch {
    return getCustomers().filter(match);
  }
}
export async function getOrdersByCustomerId(cid: string): Promise<Order[]> {
  // Always fetch fresh from Firestore
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    // Merge with local cache (don't lose local-only orders)
    mergeOrdersToCache(all);
    return getOrders().filter(o => o.customerId === cid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return getOrders().filter(o => o.customerId === cid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// ============================================================
// AUTH — Google Sign-In
// ============================================================
const _googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<{ success: boolean; uid?: string; name?: string; email?: string; photo?: string; error?: string }> {
  try {
    const result = await signInWithPopup(auth, _googleProvider);
    const u = result.user;
    return { success: true, uid: u.uid, name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' };
  } catch (e: any) {
    if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return { success: false };
    const msg = e?.code === 'auth/unauthorized-domain' ? 'Domain not authorized. Add it in Firebase Console → Auth → Settings → Authorized domains.'
      : e?.code === 'auth/popup-blocked' ? 'Popup blocked. Allow popups for this site.'
      : e?.message || 'Sign-in failed.';
    return { success: false, error: msg };
  }
}
export function onAuthChange(cb: (user: User | null) => void) { return onAuthStateChanged(auth, cb); }
export async function getFirebaseCustomer(uid: string): Promise<Customer | null> {
  try { const s = await getDoc(doc(db, 'customers', uid)); return s.exists() ? { id: s.id, ...s.data() } as Customer : null; } catch { return null; }
}

// ============================================================
// ORDERS — with merge-safe sync (never loses local orders)
// ============================================================
let _orders: Order[] | null = null;

function getOrdersRaw(): Order[] {
  if (_orders) return _orders;
  const c = cacheGet<Order[]>('cr_orders');
  _orders = c || [];
  return _orders;
}
function saveOrdersLocal(orders: Order[]) {
  _orders = orders;
  try { cacheSet('cr_orders', orders); } catch {}
}
// MERGE — combines Firestore data with local-only orders (prevents data loss)
function mergeOrdersToCache(firestoreOrders: Order[]) {
  const local = getOrdersRaw();
  const fsMap = new Map(firestoreOrders.map(o => [o.id, o]));
  // Keep local orders that aren't in Firestore yet (just created, not synced)
  const localOnly = local.filter(o => !fsMap.has(o.id));
  // Firestore data is truth for everything else
  const merged = [...firestoreOrders, ...localOnly];
  _orders = merged;
  try { cacheSet('cr_orders', merged); } catch {}
}

export function getOrders(): Order[] { return [...getOrdersRaw()]; }
export function getCustomerOrders(cid: string): Order[] { return getOrdersRaw().filter(o => o.customerId === cid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
export function getOrder(id: string) { return getOrdersRaw().find(o => o.id === id); }

export async function syncOrdersFromFirestore() {
  if (_syncInProgress) return getOrdersRaw();
  _syncInProgress = true;
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    mergeOrdersToCache(orders);
  } catch { /* offline — keep local cache */ }
  _syncInProgress = false;
  return getOrdersRaw();
}

export async function createOrder(order: Order) {
  // Initialize statusHistory
  if (!order.statusHistory) order.statusHistory = {};
  order.statusHistory[order.status] = order.createdAt;
  // 1. Save to local cache FIRST (instant)
  const all = getOrdersRaw();
  all.push(order);
  saveOrdersLocal(all);
  // 2. Write to Firestore (async, non-blocking)
  try { await setDoc(doc(db, 'orders', order.id), order); } catch (e) { console.error('Failed to save order to Firestore:', e); }
}

export async function updateOrder(order: Order) {
  const all = getOrdersRaw(); const i = all.findIndex(o => o.id === order.id);
  if (i >= 0) { all[i] = order; saveOrdersLocal(all); }
  try { await setDoc(doc(db, 'orders', order.id), order); } catch {}
}
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const now = new Date().toISOString();
  const all = getOrdersRaw(); const o = all.find(x => x.id === id);
  if (o) {
    o.status = status; o.updatedAt = now;
    if (!o.statusHistory) o.statusHistory = {};
    o.statusHistory[status] = now;
    saveOrdersLocal(all);
  }
  try { const h = o?.statusHistory || {}; h[status] = now; await updateDoc(doc(db, 'orders', id), { status, updatedAt: now, statusHistory: h }); } catch {}
}
export async function updatePaymentStatus(id: string, status: PaymentStatus, txnId?: string) {
  const all = getOrdersRaw(); const o = all.find(x => x.id === id);
  if (!o) return;
  o.paymentStatus = status; if (txnId) o.upiTransactionId = txnId; o.updatedAt = new Date().toISOString();
  saveOrdersLocal(all);
  try { const u: any = { paymentStatus: status, updatedAt: o.updatedAt }; if (txnId) u.upiTransactionId = txnId; await updateDoc(doc(db, 'orders', id), u); } catch {}
}
export async function cancelOrder(id: string) {
  const all = getOrdersRaw(); const o = all.find(x => x.id === id);
  if (!o || !['pending', 'confirmed', 'preparing'].includes(o.status)) return;
  o.status = 'cancelled'; o.updatedAt = new Date().toISOString();
  if (o.paymentStatus === 'verified') o.refundStatus = 'pending';
  saveOrdersLocal(all);
  try { const u: any = { status: 'cancelled', updatedAt: o.updatedAt }; if (o.refundStatus) u.refundStatus = 'pending'; await updateDoc(doc(db, 'orders', id), u); } catch {}
}
export async function deleteOrder(id: string) {
  saveOrdersLocal(getOrdersRaw().filter(o => o.id !== id));
  try { await deleteDoc(doc(db, 'orders', id)); } catch {}
}

// ============================================================
// ADMIN — Firebase Email/Password Auth
// ============================================================
export function isAdminAuthenticated() { return localStorage.getItem('cr_admin') === 'true'; }

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('cr_admin', 'true');
    return { success: true };
  } catch (e: any) {
    const msg = e?.code === 'auth/invalid-credential' ? 'Invalid email or password.'
      : e?.code === 'auth/user-not-found' ? 'No admin account with this email.'
      : e?.code === 'auth/wrong-password' ? 'Wrong password.'
      : e?.code === 'auth/too-many-requests' ? 'Too many attempts. Try later.'
      : e?.code === 'auth/invalid-email' ? 'Invalid email format.'
      : e?.message || 'Login failed.';
    return { success: false, error: msg };
  }
}

export function adminLogout() { localStorage.removeItem('cr_admin'); signOut(auth).catch(() => {}); }

// ============================================================
// SETTINGS
// ============================================================
let _settings: StoreSettings | null = null;
export function getSettings(): StoreSettings {
  if (_settings) return { ..._settings };
  const c = cacheGet<StoreSettings>('cr_settings');
  if (c) { _settings = { ...DEFAULT_SETTINGS, ...c }; return { ..._settings }; }
  _settings = { ...DEFAULT_SETTINGS }; cacheSet('cr_settings', DEFAULT_SETTINGS); seedSettingsIfEmpty();
  return { ...DEFAULT_SETTINGS };
}
async function seedSettingsIfEmpty() {
  try { const s = await getDoc(doc(db, 'config', 'settings')); if (!s.exists()) await setDoc(doc(db, 'config', 'settings'), DEFAULT_SETTINGS); else { _settings = { ...DEFAULT_SETTINGS, ...s.data() as StoreSettings }; cacheSet('cr_settings', _settings); } } catch {}
}
export async function saveSettings(s: StoreSettings) { _settings = s; cacheSet('cr_settings', s); try { await setDoc(doc(db, 'config', 'settings'), s); } catch {} }
export async function syncSettingsFromFirestore() {
  try { const s = await getDoc(doc(db, 'config', 'settings')); if (s.exists()) { _settings = { ...DEFAULT_SETTINGS, ...s.data() as StoreSettings }; cacheSet('cr_settings', _settings); } } catch {}
}

// ============================================================
// UPI
// ============================================================
export function getUPIId() { return getSettings().upiId; }
export function getUPIName() { return getSettings().upiName; }
export function getUPIDeepLink(app: 'gpay' | 'phonepe' | 'paytm' | 'generic', amt: number) {
  const u = getUPIId(); const n = getUPIName(); const p = `pa=${u}&pn=${encodeURIComponent(n)}&am=${amt}&cu=INR`;
  return app === 'gpay' ? `gpay://upi/pay?${p}` : app === 'phonepe' ? `phonepe://pay?${p}` : app === 'paytm' ? `paytmmp://pay?${p}` : `upi://pay?${p}`;
}
export function getDeliveryFee(sub: number) { const s = getSettings(); return sub >= s.minFreeDelivery ? 0 : s.deliveryFee; }

// ============================================================
// FRAUD
// ============================================================
export function findOrdersByTxnId(txnId: string): Order[] {
  const n = txnId.trim().toLowerCase(); return getOrdersRaw().filter(o => o.upiTransactionId && o.upiTransactionId.trim().toLowerCase() === n);
}
export function getDuplicateTransactionGroups() {
  const m = new Map<string, Order[]>();
  getOrdersRaw().forEach(o => { if (!o.upiTransactionId) return; const k = o.upiTransactionId.trim().toLowerCase(); if (!m.has(k)) m.set(k, []); m.get(k)!.push(o); });
  const g: { txnId: string; orders: Order[] }[] = []; m.forEach((o, t) => { if (o.length >= 2) g.push({ txnId: t, orders: o }); });
  return g.sort((a, b) => b.orders.length - a.orders.length);
}

// ============================================================
// CSV
// ============================================================
export function exportOrdersCSV() { const o = getOrders(); const h = 'Order ID,Customer,Phone,Date,Items,Subtotal,Delivery,Total,Status,Payment,TXN ID\n'; return h + o.map(x => { const c = getCustomers().find(q => q.id === x.customerId); return `${x.id},${c?.name || 'N/A'},${c?.phone || 'N/A'},${new Date(x.createdAt).toLocaleDateString()},${x.items.map(i => i.product.name).join(';')},${x.subtotal},${x.deliveryFee},${x.total},${x.status},${x.paymentStatus},${x.upiTransactionId || ''}`; }).join('\n'); }
export function exportProductsCSV() { const p = getProducts(); return 'ID,Name,Category,Price,MRP,Stock,Weight,Spice,Tags\n' + p.map(x => `${x.id},${x.name},${x.category},${x.price},${x.originalPrice || ''},${x.stockQty},${x.weight},${x.spiceLevel},${x.tags.join(';')}`).join('\n'); }
export function downloadCSV(csv: string, fn: string) { const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = fn; a.click(); URL.revokeObjectURL(u); }

export async function importProductsCSV(csvText: string): Promise<number> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return 0;
  let count = 0;
  for (const row of lines.slice(1)) {
    const c = row.split(',');
    if (c.length < 3 || !c[1]?.trim()) continue;
    const p: Product = { id: c[0]?.trim() || `p_${Date.now()}_${count}`, name: c[1].trim(), description: '', price: Number(c[3]) || 0, originalPrice: Number(c[4]) || undefined, image: '/images/classic-salted.jpg', images: ['/images/classic-salted.jpg'], category: (c[2] || 'General').trim(), weight: (c[6] || '100g').trim(), stockQty: Number(c[5]) || 20, inStock: (Number(c[5]) || 20) > 0, featured: false, spiceLevel: Number(c[7]) || 0, ingredients: [], tags: c[8] ? c[8].split(';').map(t => t.trim()).filter(Boolean) : [], createdAt: new Date().toISOString() };
    await addProduct(p);
    count++;
  }
  return count;
}

// ============================================================
// COUPONS
// ============================================================
let _coupons: Coupon[] | null = null;
export function getCoupons(): Coupon[] { if (_coupons) return [..._coupons]; const c = cacheGet<Coupon[]>('cr_coupons'); _coupons = c || []; return [..._coupons]; }
export async function syncCouponsFromFirestore() { try { const s = await getDocs(collection(db, 'coupons')); _coupons = s.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)); cacheSet('cr_coupons', _coupons); } catch {} }
export async function saveCoupon(c: Coupon) { if (!_coupons) _coupons = []; const i = _coupons.findIndex(x => x.id === c.id); if (i >= 0) _coupons[i] = c; else _coupons.push(c); cacheSet('cr_coupons', _coupons); try { await setDoc(doc(db, 'coupons', c.id), c); } catch {} }
export async function deleteCoupon(id: string) { if (_coupons) _coupons = _coupons.filter(c => c.id !== id); cacheSet('cr_coupons', _coupons || []); try { await deleteDoc(doc(db, 'coupons', id)); } catch {} }

export function validateCoupon(code: string, subtotal: number, customerId?: string): { valid: boolean; coupon?: Coupon; discount?: number; error?: string } {
  const all = getCoupons();
  const c = all.find(x => x.code.toLowerCase() === code.toLowerCase().trim() && x.active);
  if (!c) return { valid: false, error: 'Invalid coupon code' };
  const now = new Date();
  if (new Date(c.validFrom) > now) return { valid: false, error: 'Coupon not yet active' };
  if (new Date(c.validUntil) < now) return { valid: false, error: 'Coupon expired' };
  if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { valid: false, error: 'Coupon usage limit reached' };
  // Per-user check: count how many times this customer already used this coupon
  if (c.perUser > 0 && customerId) {
    const userUses = getOrders().filter(o => o.customerId === customerId && o.couponCode && o.couponCode.toLowerCase() === c.code.toLowerCase() && o.status !== 'cancelled').length;
    if (userUses >= c.perUser) return { valid: false, error: `You've already used this coupon ${c.perUser === 1 ? '' : c.perUser + ' times'}` };
  }
  if (subtotal < c.minOrder) return { valid: false, error: `Minimum order ₹${c.minOrder} required` };
  let discount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.type === 'percent' && c.maxDiscount && discount > c.maxDiscount) discount = c.maxDiscount;
  if (discount > subtotal) discount = subtotal;
  return { valid: true, coupon: c, discount };
}

export async function useCoupon(id: string) {
  const all = getCoupons(); const c = all.find(x => x.id === id); if (!c) return;
  c.usedCount = (c.usedCount || 0) + 1;
  if (_coupons) { const i = _coupons.findIndex(x => x.id === id); if (i >= 0) _coupons[i] = c; }
  cacheSet('cr_coupons', _coupons || []);
  try { await updateDoc(doc(db, 'coupons', id), { usedCount: c.usedCount }); } catch {}
}

// Temporary coupon selection (cart -> checkout)
export function setAppliedCouponState(data: { code: string; discount: number; couponId?: string } | null) {
  if (!data) localStorage.removeItem('cr_applied_coupon');
  else cacheSet('cr_applied_coupon', data);
}
export function getAppliedCouponState(): { code: string; discount: number; couponId?: string } | null {
  return cacheGet<{ code: string; discount: number; couponId?: string }>('cr_applied_coupon');
}
export function clearAppliedCouponState() { localStorage.removeItem('cr_applied_coupon'); }

// ============================================================
// SYNC ALL
// ============================================================
export async function syncAll() {
  await Promise.allSettled([syncProductsFromFirestore(), syncOrdersFromFirestore(), syncCustomersFromFirestore(), syncSettingsFromFirestore(), syncCouponsFromFirestore()]);
}
