import { useEffect, useState, useCallback } from 'react';
import { db, firebaseConfigured } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { sanitize, sanitizeNumber, rateLimit } from './sanitize';

export interface WishlistItem {
  id: string;
  title: string;
  rate: number;
  mrp: number;
  imageUrl: string;
  stock: number;
  maxQty: number;
  catagory?: string;
}

function normalizeWishlistItem(id: string, data: Record<string, unknown>): WishlistItem {
  return {
    id,
    title: String(data.title ?? ''),
    rate: Number(data.rate ?? data.price ?? 0) || 0,
    mrp: Number(data.mrp ?? 0) || 0,
    imageUrl: String(data.imageUrl ?? data.image ?? ''),
    stock: Number(data.stock ?? 999) || 999,
    maxQty: Number(data.maxQty ?? data.stock ?? 1) || 1,
    catagory: String(data.catagory ?? data.category ?? 'Food'),
  };
}

export function useWishlist(user: User | null) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!firebaseConfigured || !user) { setItems([]); return; }
    const ref = collection(db, 'users', user.uid, 'wishlist');
    const unsub = onSnapshot(ref, snap => {
      const list: WishlistItem[] = [];
      snap.forEach(d => list.push(normalizeWishlistItem(d.id, d.data() as Record<string, unknown>)));
      setItems(list);
    }, () => {});
    return unsub;
  }, [user]);

  const toggle = useCallback(async (product: WishlistItem) => {
    if (!firebaseConfigured || !user) return false;
    if (!rateLimit('wishlist', 30)) return false;
    const ref = doc(db, 'users', user.uid, 'wishlist', product.id);
    const exists = items.some(i => i.id === product.id);
    if (exists) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        title: sanitize(product.title, 200),
        rate: sanitizeNumber(product.rate),
        mrp: sanitizeNumber(product.mrp),
        imageUrl: product.imageUrl,
        stock: Math.max(0, Math.round(product.stock || 0)),
        maxQty: Math.max(1, Math.round(product.maxQty || 1)),
        catagory: sanitize(product.catagory || '', 100),
      });
    }
    return !exists;
  }, [user, items]);

  const has = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return { items, toggle, has };
}

export type WishlistActions = ReturnType<typeof useWishlist>;
