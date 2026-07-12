import { useEffect, useMemo, useRef, useState } from 'react';
import { CartActions } from '../lib/useCart';
import { useProducts } from '../lib/useSettings';
import { WishlistActions } from '../lib/useWishlist';

const heartIconStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  display: 'block',
};

interface Props {
  cart: CartActions;
  searchQuery: string;
  wishlist: WishlistActions;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const sortLabels = {
  latest: 'Latest',
  priceLow: 'Rate: Low to High',
  priceHigh: 'Rate: High to Low',
  discountHigh: 'Best Discount',
} as const;

const filterLabels = {
  all: 'All',
  under2000: 'Under ₹2,000',
  between2000and3000: '₹2,000 - ₹3,000',
  above3000: 'Above ₹3,000',
} as const;

export default function ProductGrid({ cart, searchQuery, wishlist, isLoggedIn, onLoginClick }: Props) {
  const { products: firestoreProducts, loading } = useProducts();
  const [visibleCount, setVisibleCount] = useState(10);
  const [sortBy, setSortBy] = useState<'latest' | 'priceLow' | 'priceHigh' | 'discountHigh'>('latest');
  const [filterBy, setFilterBy] = useState<'all' | 'under2000' | 'between2000and3000' | 'above3000'>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sortRef.current && !sortRef.current.contains(target)) setShowSortMenu(false);
      if (filterRef.current && !filterRef.current.contains(target)) setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let list = firestoreProducts.filter((p) => {
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.catagory.toLowerCase().includes(q);
      const matchesFilter =
        filterBy === 'all' ? true :
        filterBy === 'under2000' ? p.rate < 2000 :
        filterBy === 'between2000and3000' ? p.rate >= 2000 && p.rate <= 3000 :
        p.rate > 3000;
      return matchesSearch && matchesFilter;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'priceLow') return a.rate - b.rate;
      if (sortBy === 'priceHigh') return b.rate - a.rate;
      if (sortBy === 'discountHigh') {
        const da = a.mrp > a.rate ? ((a.mrp - a.rate) / a.mrp) * 100 : 0;
        const db = b.mrp > b.rate ? ((b.mrp - b.rate) / b.mrp) * 100 : 0;
        return db - da;
      }
      return a.order - b.order;
    });

    return list;
  }, [searchQuery, firestoreProducts, sortBy, filterBy]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  useEffect(() => { setVisibleCount(10); }, [searchQuery, sortBy, filterBy]);

  if (loading) {
    return <div style={{ padding: '40px 16px', textAlign: 'center' }}><span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>Loading products...</span></div>;
  }

  if (firestoreProducts.length === 0) {
    return <div style={{ padding: '40px 16px', textAlign: 'center' }}><span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>No products yet. Import demo data from the menu.</span></div>;
  }

  return (
    <div style={{ padding: '0 16px', marginTop: 8, paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap' }}>
          {searchQuery ? `Results for "${searchQuery}"` : 'All products'}
        </h3>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        {searchQuery && <span style={{ fontSize: '.75rem', color: 'var(--text-sec)', whiteSpace: 'nowrap' }}>{filtered.length} found</span>}
      </div>

      {/* Custom Sort / Filter row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div ref={sortRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowSortMenu(v => !v); setShowFilterMenu(false); }} style={{ height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '.74rem', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--text-sec)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}><path d="M8 6h13" /><path d="M3 6h2" /><path d="M3 12h8" /><path d="M14 12h7" /><path d="M3 18h13" /><path d="M19 18h2" /></svg>
            Sort
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--text-sec)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}><path d="M7 10l5 5 5-5" /></svg>
          </button>
          {showSortMenu && <div className="card-gpu" style={{ position: 'absolute', top: 40, right: 0, minWidth: 170, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 10px 18px rgba(0,0,0,.08)', overflow: 'hidden', zIndex: 20 }}>{Object.entries(sortLabels).map(([key, label]) => <button key={key} onClick={() => { setSortBy(key as typeof sortBy); setShowSortMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: sortBy === key ? 'var(--hover)' : 'transparent', color: sortBy === key ? 'var(--text)' : 'var(--text-sec)', fontSize: '.74rem', fontWeight: sortBy === key ? 600 : 500, fontFamily: 'inherit', cursor: 'pointer' }}>{label}</button>)}</div>}
        </div>

        <div ref={filterRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowFilterMenu(v => !v); setShowSortMenu(false); }} style={{ height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '.74rem', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--text-sec)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}><path d="M3 5h18" /><path d="M6 12h12" /><path d="M10 19h4" /></svg>
            Filter
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--text-sec)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}><path d="M7 10l5 5 5-5" /></svg>
          </button>
          {showFilterMenu && <div className="card-gpu" style={{ position: 'absolute', top: 40, right: 0, minWidth: 170, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 10px 18px rgba(0,0,0,.08)', overflow: 'hidden', zIndex: 20 }}>{Object.entries(filterLabels).map(([key, label]) => <button key={key} onClick={() => { setFilterBy(key as typeof filterBy); setShowFilterMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: filterBy === key ? 'var(--hover)' : 'transparent', color: filterBy === key ? 'var(--text)' : 'var(--text-sec)', fontSize: '.74rem', fontWeight: filterBy === key ? 600 : 500, fontFamily: 'inherit', cursor: 'pointer' }}>{label}</button>)}</div>}
        </div>
      </div>

      {filtered.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center' }}><div style={{ fontSize: '.88rem', color: 'var(--text-sec)', marginBottom: 4 }}>No products found</div><div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>Try a different search term or filter</div></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {visibleProducts.map((p) => {
          const qty = cart.items[p.id]?.qty || 0;
          const discount = p.mrp > p.rate ? Math.round(((p.mrp - p.rate) / p.mrp) * 100) : 0;
          const wished = wishlist.has(p.id);
          const orderLimit = Math.min(p.maxQty || 1, p.stock || 0);
          const outOfStock = (p.stock || 0) <= 0;

          return (
            <div key={p.id} className="card-gpu" style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#eee', overflow: 'hidden' }}>
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                <button onClick={async () => {
                  const shareData = { title: p.title, text: p.description, url: window.location.href };
                  try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(`${p.title} — ${window.location.href}`); alert('Product link copied to clipboard'); } } catch {}
                }} aria-label="Share" style={{ position: 'absolute', top: 8, left: 8, width: 32, height: 32, borderRadius: 16, border: 'none', background: 'rgba(255,255,255,.96)', boxShadow: '0 1px 6px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, color: 'var(--text)', zIndex: 1 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}><path d="M12 3v6" /><path d="M12 3l-2.5 2.5" /><path d="M12 3l2.5 2.5" /><path d="M7 10.5v6.5A2 2 0 0 0 9 19h6a2 2 0 0 0 2-2v-6.5" /><path d="M9.5 13.5 12 11l2.5 2.5" /></svg>
                </button>
                <button onClick={() => { if (!isLoggedIn) { onLoginClick(); return; } wishlist.toggle({ id: p.id, title: p.title, rate: p.rate, mrp: p.mrp, imageUrl: p.imageUrl, stock: p.stock, maxQty: p.maxQty, catagory: p.catagory }); }} aria-label="Wishlist" style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, border: 'none', background: 'rgba(255,255,255,.96)', boxShadow: '0 1px 6px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, color: wished ? '#e74c3c' : 'var(--text-sec)', zIndex: 1 }}>
                  <svg viewBox="0 0 24 24" style={{ ...heartIconStyle, fill: wished ? '#e74c3c' : 'none' }}><path d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 014.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12z" /></svg>
                </button>

              </div>

              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                <div style={{ fontSize: '.74rem', color: 'var(--text-sec)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{p.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)' }}>₹{p.rate.toLocaleString('en-IN')}</span>
                  {p.mrp > p.rate && <span style={{ fontSize: '.64rem', color: 'var(--text-sec)', textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</span>}
                  {discount > 0 && <span style={{ fontSize: '.64rem', fontWeight: 600, color: '#27ae60' }}>{discount}% off</span>}
                </div>
                {qty === 0 ? (
                  <button disabled={outOfStock} onClick={() => cart.add({ id: p.id, title: p.title, price: p.rate, mrp: p.mrp, image: p.imageUrl, stock: p.stock, maxQty: p.maxQty, catagory: p.catagory })} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: outOfStock ? 'var(--hover)' : 'none', color: outOfStock ? 'var(--text-sec)' : 'var(--text)', fontSize: '.78rem', fontWeight: 600, cursor: outOfStock ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{outOfStock ? 'Out of stock' : 'Add to cart'}</button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <button onClick={() => cart.dec(p.id)} style={{ width: 38, height: 34, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'inherit' }}>−</button>
                    <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)' }}>{qty}</span>
                    <button disabled={qty >= orderLimit} onClick={() => cart.inc(p.id)} style={{ width: 38, height: 34, border: 'none', background: 'none', cursor: qty >= orderLimit ? 'not-allowed' : 'pointer', color: qty >= orderLimit ? 'var(--text-sec)' : 'var(--text)', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'inherit' }}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
          <button onClick={() => setVisibleCount(prev => prev + 10)} style={{ background: '#0b57cf', color: '#fff', border: '1px solid #0b57cf', borderRadius: 8, padding: '10px 20px', minWidth: 108, fontSize: '.8rem', lineHeight: 1.2, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 10px 8px -8px rgba(0,0,0,.12)' }}>Show more</button>
        </div>
      )}
    </div>
  );
}
