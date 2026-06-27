import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, Category } from '../types';
import { subscribeToProducts, subscribeToCategories } from '../lib/firebase';


interface ProductCtx {
  products: Product[];
  categories: Category[];
  loading: boolean;
}

const Ctx = createContext<ProductCtx | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((firebaseProducts) => {
      setProducts(firebaseProducts);
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
    <Ctx.Provider value={{ products, categories, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProducts must be inside ProductProvider');
  return ctx;
}
