import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore';

// SAME Firebase config as user website — loaded from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ── Admin Auth (Email/Password) ── */
export async function adminLogin(email: string, password: string): Promise<{ user: User | null; error: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Verify admin UID exists in config/admins
    const adminDoc = await getDoc(doc(db, 'config', 'admins'));
    if (!adminDoc.exists() || !adminDoc.data().uids?.includes(cred.user.uid)) {
      await fbSignOut(auth);
      return { user: null, error: 'Access denied. Not an admin account.' };
    }
    return { user: cred.user, error: '' };
  } catch (e: any) {
    const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential' ? 'Invalid email or password'
      : e.code === 'auth/user-not-found' ? 'Account not found'
      : e.code === 'auth/too-many-requests' ? 'Too many attempts. Try later.'
      : 'Login failed';
    return { user: null, error: msg };
  }
}

export async function adminLogout() { await fbSignOut(auth); }
export function onAdminAuth(cb: (u: User | null) => void) { return onAuthStateChanged(auth, cb); }

/* ── Dashboard Stats ── */
export async function getDashboardStats() {
  const [ordersSnap, productsSnap, contactsSnap] = await Promise.all([
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'contacts')),
  ]);
  let totalRevenue = 0; let pending = 0; let delivered = 0;
  ordersSnap.forEach(d => {
    const data = d.data();
    totalRevenue += data.totalAmount || 0;
    if (data.status === 'pending') pending++;
    if (data.status === 'delivered') delivered++;
  });
  return { totalOrders: ordersSnap.size, totalProducts: productsSnap.size, totalContacts: contactsSnap.size, totalRevenue, pending, delivered };
}

/* ── Products CRUD ── */
export function subscribeProducts(cb: (p: any[]) => void) {
  return onSnapshot(collection(db, 'products'), snap => {
    const arr: any[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() })); cb(arr);
  });
}

export async function createProduct(data: Record<string, any>) {
  const id = data.id || data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
  await setDoc(doc(db, 'products', id), { ...data, id, _ts: serverTimestamp() });
  return id;
}

export async function updateProduct(id: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'products', id), { ...data, _updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) { await deleteDoc(doc(db, 'products', id)); }

/* ── Orders ── */
export function subscribeOrders(cb: (o: any[]) => void) {
  return onSnapshot(collection(db, 'orders'), snap => {
    const arr: any[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    cb(arr);
  });
}

export async function updateOrderStatus(id: string, status: string) {
  const updates: Record<string, any> = { status };
  if (status === 'delivered') updates.deliveredAt = new Date().toISOString();
  if (['shipped', 'delivered'].includes(status)) updates.canCancel = false;
  await updateDoc(doc(db, 'orders', id), updates);
}

/* ── Coupons ── */
export function subscribeCoupons(cb: (c: any[]) => void) {
  return onSnapshot(collection(db, 'coupons'), snap => {
    const arr: any[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() })); cb(arr);
  });
}

export async function createCoupon(code: string, data: { discount: number; type: string; minOrder: number; active: boolean; maxDiscount?: number }) {
  await setDoc(doc(db, 'coupons', code.toUpperCase()), data);
}

export async function toggleCoupon(code: string, active: boolean) {
  await updateDoc(doc(db, 'coupons', code), { active });
}

export async function deleteCoupon(code: string) { await deleteDoc(doc(db, 'coupons', code)); }

/* ── Gift Cards ── */
export function subscribeGiftCards(cb: (g: any[]) => void) {
  return onSnapshot(collection(db, 'giftcards'), snap => {
    const arr: any[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() })); cb(arr);
  });
}

export async function createGiftCard(code: string, balance: number) {
  await setDoc(doc(db, 'giftcards', code.toUpperCase()), { balance, active: true });
}

export async function deleteGiftCard(code: string) { await deleteDoc(doc(db, 'giftcards', code)); }

/* ── Contacts ── */
export function subscribeContacts(cb: (c: any[]) => void) {
  return onSnapshot(collection(db, 'contacts'), snap => {
    const arr: any[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    cb(arr);
  });
}

export async function deleteContact(id: string) { await deleteDoc(doc(db, 'contacts', id)); }

/* ── Site Config ── */
export async function getSiteConfig() {
  const snap = await getDoc(doc(db, 'config', 'site'));
  return snap.exists() ? snap.data() : {};
}

export async function updateSiteConfig(data: Record<string, any>) {
  await setDoc(doc(db, 'config', 'site'), data, { merge: true });
}

/* ── Categories ── */
export async function getCategories(): Promise<string[]> {
  const snap = await getDoc(doc(db, 'config', 'categories'));
  return snap.exists() ? snap.data().list || [] : [];
}

export async function updateCategories(list: string[]) {
  await setDoc(doc(db, 'config', 'categories'), { list });
}
