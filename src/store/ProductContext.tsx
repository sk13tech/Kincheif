import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, Category } from '../types';
import { subscribeToProducts, subscribeToCategories } from '../lib/firebase';
import { products as localProducts, categories as localCategories } from '../data/products';

interface ProductCtx {
  products: Product[];
  categories: Category[];
  loading: boolean;
  source: 'firebase' | 'local';
}

const Ctx = createContext<ProductCtx | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [categories, setCategories] = useState<Category[]>([...localCategories]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'firebase' | 'local'>('local');

  useEffect(() => {
    // Try to load from Firestore
    const unsubProducts = subscribeToProducts((firebaseProducts) => {
      if (firebaseProducts.length > 0) {
        setProducts(firebaseProducts);
        setSource('firebase');
      } else {
        // Firestore empty → use local fallback data (no auto-seed)
        setProducts(localProducts);
        setSource('local');
      }
      setLoading(false);
    });

    const unsubCats = subscribeToCategories((cats) => {
      if (cats.length > 0) {
        setCategories(['All', ...cats] as Category[]);
      }
    });

    return () => { unsubProducts(); unsubCats(); };
  }, []);

  return (
    <Ctx.Provider value={{ products, categories, loading, source }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProducts must be inside ProductProvider');
  return ctx;
}
