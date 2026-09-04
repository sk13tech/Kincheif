import { useState, useEffect } from 'react';
import { db, firebaseConfigured } from './firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';

export interface SiteData { name: string; tagline: string; foundedYear: number; }
export function useSite() {
  const [data, setData] = useState<SiteData | null>(null);
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'settings', 'site'), snap => { if (snap.exists()) setData(snap.data() as SiteData); }, () => {});
    return unsub;
  }, []);
  return data;
}

export interface AboutData {
  author: { name: string; tagline: string; description: string; profileImage: string };
  offerings: { title: string; description: string }[];
  team: { name: string; role: string; initials: string; order: number }[];
}
export function useAbout() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!firebaseConfigured) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'settings', 'about'), snap => { if (snap.exists()) setData(snap.data() as AboutData); setLoading(false); }, () => setLoading(false));
    return unsub;
  }, []);
  return { data, loading };
}

export interface ContactData { email: string; phone: string; address: string; businessHours: { mondayFriday: string; saturday: string; sunday: string } }
export function useContact() {
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!firebaseConfigured) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'settings', 'contact'), snap => { if (snap.exists()) setData(snap.data() as ContactData); setLoading(false); }, () => setLoading(false));
    return unsub;
  }, []);
  return { data, loading };
}

export interface SocialLink { url: string; show: boolean }
export interface SocialData {
  facebook?: SocialLink; instagram?: SocialLink; twitter?: SocialLink; youtube?: SocialLink;
  telegram?: SocialLink; whatsapp?: SocialLink; linkedin?: SocialLink; github?: SocialLink;
  [key: string]: SocialLink | undefined;
}
export function useSocial() {
  const [data, setData] = useState<SocialData | null>(null);
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'settings', 'social'), snap => { if (snap.exists()) setData(snap.data() as SocialData); }, () => {});
    return unsub;
  }, []);
  return data;
}

export interface CouponItem { code: string; type: 'percent' | 'flat'; value: number; minOrder: number; maxDiscount: number; active: boolean; }
export function useCoupons() {
  const [items, setItems] = useState<CouponItem[]>([]);
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'settings', 'coupons'), snap => { if (snap.exists()) setItems((snap.data().items || []) as CouponItem[]); }, () => {});
    return unsub;
  }, []);
  return items;
}

export interface GiftCardItem { code: string; balance: number; active: boolean; }
export function useGiftCards() {
  const [items, setItems] = useState<GiftCardItem[]>([]);
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'settings', 'giftCards'), snap => { if (snap.exists()) setItems((snap.data().items || []) as GiftCardItem[]); }, () => {});
    return unsub;
  }, []);
  return items;
}

export interface ReelItem { url: string; order: number }
export function useReels() {
  const [items, setItems] = useState<ReelItem[]>([]);
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'settings', 'reels'), snap => {
      if (snap.exists()) {
        const data = snap.data();
        const list = (data.items || []) as ReelItem[];
        setItems(list.sort((a, b) => a.order - b.order));
      }
    }, () => {});
    return unsub;
  }, []);
  return items;
}

export interface ConfigData {
  freeDeliveryMin: number;
  deliveryCharge: number;
  upiId: string;
  codEnabled?: boolean;
  codMaxAmount?: number;
  codExtraCharge?: number;
}
export function useConfig() {
  const [data, setData] = useState<ConfigData | null>(null);
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'settings', 'config'), snap => { if (snap.exists()) setData(snap.data() as ConfigData); }, () => {});
    return unsub;
  }, []);
  return data;
}

export interface ProductData {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  rate: number;
  mrp: number;
  stock: number;
  catagory: string;
  order: number;
  maxQty: number;
}

function normalizeProduct(id: string, data: Record<string, unknown>): ProductData {
  const rate = Number(data.rate ?? data.price ?? 0);
  const mrp = Number(data.mrp ?? 0);
  const stock = Number(data.stock ?? 999);
  const maxQty = Number(data.maxQty ?? Math.max(1, stock));
  return {
    id,
    imageUrl: String(data.imageUrl ?? data.image ?? ''),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    rate: Number.isFinite(rate) ? rate : 0,
    mrp: Number.isFinite(mrp) ? mrp : 0,
    stock: Number.isFinite(stock) ? stock : 999,
    catagory: String(data.catagory ?? data.category ?? 'Food'),
    order: Number(data.order ?? 0) || 0,
    maxQty: Number.isFinite(maxQty) ? maxQty : 1,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!firebaseConfigured) { setLoading(false); return; }
    const q = query(collection(db, 'products'), orderBy('order'));
    const unsub = onSnapshot(q, snap => {
      const items: ProductData[] = [];
      snap.forEach(d => {
        const data = d.data() as Record<string, unknown>;
        if (data.title) items.push(normalizeProduct(d.id, data));
      });
      setProducts(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { products, loading };
}
