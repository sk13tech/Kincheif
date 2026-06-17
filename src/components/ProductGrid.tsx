import { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { useProducts } from '../store/ProductContext';
import type { Category, SortOption, Product } from '../types';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { onViewProduct: (p: Product) => void; searchQuery?: string; }
const PAGE_SIZE = 10;

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-sand-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-sand-200" />
      <div className="p-3.5 space-y-2.5">
        <div className="flex gap-1.5"><div className="h-3 w-8 rounded bg-sand-200" /><div className="h-3 w-12 rounded bg-sand-200" /></div>
        <div className="h-4 w-3/4 rounded bg-sand-200" />
        <div className="h-3 w-full rounded bg-sand-100" />
        <div className="h-3 w-2/3 rounded bg-sand-100" />
        <div className="flex items-end justify-between pt-2">
          <div><div className="h-5 w-14 rounded bg-sand-200" /><div className="h-2.5 w-10 rounded bg-sand-100 mt-1" /></div>
          <div className="h-8 w-16 rounded-full bg-sand-200" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ onViewProduct, searchQuery }: Props) {
  const { products, categories, loading } = useProducts();
  const [cat, setCat] = useState<Category>('All');
  const [sort, setSort] = useState<SortOption>('popular');
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortOpts: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  const filtered = useMemo(() => {
    let r = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
    }
    if (cat !== 'All') r = r.filter(p => p.category === cat);
    switch (sort) {
      case 'price-low': r.sort((a, b) => a.price - b.price); break;
      case 'price-high': r.sort((a, b) => b.price - a.price); break;
      case 'rating': r.sort((a, b) => b.rating - a.rating); break;
      case 'newest': r.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: r.sort((a, b) => b.reviews - a.reviews); break;
    }
    return r;
  }, [products, cat, sort, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const handleCatChange = (c: Category) => { setCat(c); setVisibleCount(PAGE_SIZE); };

  return (
    <section className="pb-10">
      {searchQuery && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-2 text-center">
          <h2 className="font-serif text-xl sm:text-2xl text-ink-900">Results for <em>"{searchQuery}"</em></h2>
        </div>
      )}

      {/* Sticky bar */}
      <div className="sticky top-14 z-30 bg-sand-50/92 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="overflow-x-auto scrollbar-none -mx-1">
            <div className="flex gap-1.5 px-1 min-w-max">
              {categories.map(c => (
                <button key={c} onClick={() => handleCatChange(c)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-wide transition-all active:scale-95 ${cat === c ? 'bg-ink-900 text-sand-50' : 'border border-sand-300 bg-white text-ink-500 hover:border-ink-400 hover:text-ink-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[12px] text-ink-400">
              {loading ? <span className="h-3 w-20 inline-block rounded bg-sand-200 animate-pulse" /> :
                <><span className="font-semibold text-ink-700">{visible.length}</span> of <span className="font-semibold text-ink-700">{filtered.length}</span></>}
            </p>
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)} className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[11px] font-medium text-ink-600 hover:border-ink-400 active:scale-95">
                <SlidersHorizontal className="h-3.5 w-3.5" />{sortOpts.find(o => o.value === sort)?.label}<ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-lg border border-sand-200 bg-white shadow-lg py-0.5">
                      {sortOpts.map(o => (
                        <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                          className={`w-full text-left px-3.5 py-2.5 text-[12px] ${sort === o.value ? 'bg-sand-100 text-ink-900 font-semibold' : 'text-ink-600 hover:bg-sand-50'}`}>{o.label}</button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-5">
        {loading ? (
          /* ── Skeleton Grid ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} onViewProduct={onViewProduct} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-6 py-2.5 text-[13px] font-semibold text-ink-600 hover:border-ink-400 hover:shadow-sm active:scale-[0.97]">
                  Show More <ChevronRight className="h-4 w-4" />
                </button>
                <p className="mt-2 text-[11px] text-ink-400">{filtered.length - visibleCount} more</p>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-ink-400 italic">No products found</p>
          </div>
        )}
      </div>
    </section>
  );
}
