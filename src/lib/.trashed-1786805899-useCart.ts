import { useState, useCallback } from 'react';

export interface CartProduct {
  id: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  stock: number;
  maxQty: number;
  catagory?: string;
}

export interface CartItem {
  product: CartProduct;
  qty: number;
}

function getLimit(product: CartProduct) {
  const stock = Math.max(0, product.stock || 0);
  const maxQty = Math.max(1, product.maxQty || 1);
  return Math.min(stock, maxQty);
}

export function useCart() {
  const [items, setItems] = useState<Record<string, CartItem>>({});

  const add = useCallback((product: CartProduct) => {
    setItems(prev => {
      const existing = prev[product.id];
      const limit = getLimit(product);
      if (limit <= 0) return prev;
      const nextQty = existing ? Math.min(existing.qty + 1, limit) : 1;
      return { ...prev, [product.id]: { product, qty: nextQty } };
    });
  }, []);

  const inc = useCallback((id: string) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      const limit = getLimit(prev[id].product);
      if (prev[id].qty >= limit) return prev;
      return { ...prev, [id]: { ...prev[id], qty: prev[id].qty + 1 } };
    });
  }, []);

  const dec = useCallback((id: string) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      if (prev[id].qty <= 1) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: { ...prev[id], qty: prev[id].qty - 1 } };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => { const { [id]: _, ...rest } = prev; return rest; });
  }, []);

  const clear = useCallback(() => setItems({}), []);

  const cartItems = Object.values(items);
  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const totalSaved = cartItems.reduce((s, i) => s + (i.product.mrp - i.product.price) * i.qty, 0);

  return { items, cartItems, totalQty, totalPrice, totalSaved, add, inc, dec, remove, clear };
}

export type CartActions = ReturnType<typeof useCart>;
