import { useEffect, useState, useCallback } from 'react';
import { db } from './firebase';
import { collection, doc, updateDoc, onSnapshot, orderBy, query, Timestamp, runTransaction } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CartItem } from './useCart';
import { sanitize, sanitizeUTR, sanitizeCode, sanitizeNumber, sanitizeUrl, rateLimit } from './sanitize';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  qty: number;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  giftCardCode: string;
  giftCardUsed: number;
  delivery: number;
  total: number;
  amountPaid: number;
  utrNumber: string;
  address?: DeliveryAddress;
  status: string;
  cancelRemark: string;
  cancelledAt?: Timestamp;
  refundTxnId?: string;
  refundDate?: Timestamp;
  trackingLink?: string;
  trackingId?: string;
  createdAt: Timestamp;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlaceOrderData {
  cartItems: CartItem[];
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  giftCardCode: string;
  giftCardUsed: number;
  delivery: number;
  total: number;
  amountPaid: number;
  utrNumber: string;
  address: DeliveryAddress;
}

const CANCELLABLE = ['pending', 'placed', 'confirmed', 'processing'];

export function useOrders(user: User | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setOrders([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const list: Order[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Order));
      setOrders(list);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const placeOrder = useCallback(async (data: PlaceOrderData) => {
    if (!user) return null;
    if (!rateLimit('placeOrder', 5)) { alert('Too many orders. Please wait a minute.'); return null; }

    // Validate totals
    const calcSubtotal = data.cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
    if (Math.abs(calcSubtotal - data.subtotal) > 1) return null;
    if (data.total < 0 || data.amountPaid < 0 || data.delivery < 0) return null;

    const orderItems: OrderItem[] = data.cartItems.map(ci => ({
      productId: sanitize(ci.product.id, 50),
      title: sanitize(ci.product.title, 200),
      price: sanitizeNumber(ci.product.price),
      mrp: sanitizeNumber(ci.product.mrp),
      image: sanitizeUrl(ci.product.image || ''),
      qty: Math.max(1, Math.min(99, Math.round(ci.qty))),
    }));

    const cleanAddr: DeliveryAddress = {
      name: sanitize(data.address.name, 100),
      phone: data.address.phone.replace(/[^0-9+]/g, '').slice(0, 15),
      line1: sanitize(data.address.line1, 200),
      line2: sanitize(data.address.line2, 200),
      city: sanitize(data.address.city, 50),
      state: sanitize(data.address.state, 50),
      pincode: data.address.pincode.replace(/[^0-9]/g, '').slice(0, 6),
    };

    const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
    const giftCode = sanitizeCode(data.giftCardCode);
    const giftUsed = sanitizeNumber(data.giftCardUsed);

    // Generate order ID: ORD + DDMMYYYYHHMMSS + 5 random digits
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const rand5 = String(Math.floor(10000 + Math.random() * 90000));
    const randomOrderId = `ORD${dd}${mm}${yyyy}${hh}${mi}${ss}${rand5}`;

    await runTransaction(db, async (tx) => {
      // Validate and deduct gift card atomically
      if (giftCode && giftUsed > 0) {
        const giftDocRef = doc(db, 'settings', 'giftCards');
        const giftSnap = await tx.get(giftDocRef);
        if (!giftSnap.exists()) throw new Error('Gift card store unavailable');
        const giftData = giftSnap.data();
        const items = Array.isArray(giftData.items) ? [...giftData.items] : [];
        const idx = items.findIndex((g: { code?: string }) => g.code === giftCode);
        if (idx < 0) throw new Error('Gift card not found');
        const card = items[idx];
        if (!card.active) throw new Error('Gift card inactive');
        if ((card.balance || 0) < giftUsed) throw new Error('Insufficient gift card balance');
        card.balance = Math.max(0, sanitizeNumber(card.balance) - giftUsed);
        if (card.balance <= 0) card.active = false;
        items[idx] = card;
        tx.update(giftDocRef, { items, updatedAt: Timestamp.now() });
      }

      tx.set(orderRef, {
        orderId: randomOrderId,
        userId: user.email || user.uid,
        items: orderItems,
        subtotal: sanitizeNumber(data.subtotal),
        couponCode: sanitizeCode(data.couponCode),
        couponDiscount: sanitizeNumber(data.couponDiscount),
        giftCardCode: giftCode,
        giftCardUsed: giftUsed,
        delivery: sanitizeNumber(data.delivery),
        total: sanitizeNumber(data.total),
        amountPaid: sanitizeNumber(data.amountPaid),
        utrNumber: sanitizeUTR(data.utrNumber),
        address: cleanAddr,
        status: 'pending',
        cancelRemark: '',
        createdAt: Timestamp.now(),
      });
    });

    return randomOrderId;
  }, [user]);

  const cancelOrder = useCallback(async (orderId: string, remark: string) => {
    if (!user) return false;
    if (!rateLimit('cancelOrder', 3)) { alert('Too many cancellation attempts. Please wait.'); return false; }
    const order = orders.find(o => o.id === orderId);
    if (!order || !CANCELLABLE.includes(order.status)) return false;
    await updateDoc(doc(db, 'users', user.uid, 'orders', orderId), {
      status: 'cancelled',
      cancelRemark: sanitize(remark, 200),
      cancelledAt: Timestamp.now(),
      refundTxnId: '',
      refundDate: null,
    });
    return true;
  }, [user, orders]);

  const requestReplacement = useCallback(async (orderId: string) => {
    if (!user) return false;
    if (!rateLimit('replacement', 3)) { alert('Too many requests. Please wait.'); return false; }
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'delivered') return false;
    const deliveredAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    if ((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24) > 3) return false;
    await updateDoc(doc(db, 'users', user.uid, 'orders', orderId), { status: 'replacement_requested' });
    return true;
  }, [user, orders]);

  const canCancel = useCallback((status: string) => CANCELLABLE.includes(status), []);
  const canReplace = useCallback((order: Order) => {
    if (order.status !== 'delivered') return false;
    const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) <= 3;
  }, []);

  return { orders, loading, placeOrder, cancelOrder, requestReplacement, canCancel, canReplace };
}

export type OrderActions = ReturnType<typeof useOrders>;
