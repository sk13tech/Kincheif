import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../types';
import { useCart } from '../store/CartContext';

interface Props {
  product: Product;
  onBack: () => void;
}

export default function ProductDetail({ product, onBack }: Props) {
  const { addItem, items, updateQuantity, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgDir, setImgDir] = useState(0);

  const ci = items.find((i) => i.product.id === product.id);
  const qty = ci?.quantity || 0;
  const off = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imgs = product.images.length > 0 ? product.images : [product.image];

  const doAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  const doBuy = () => {
    if (!ci) addItem(product);
    openCart();
  };

  const goImg = (dir: number) => {
    setImgDir(dir);
    setImgIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return imgs.length - 1;
      if (next >= imgs.length) return 0;
      return next;
    });
  };

  const imgVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-sand-50 pt-14"
    >
      {/* Breadcrumb */}
      <div className="sticky top-14 z-10 bg-sand-50/92 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-300 bg-white text-ink-500 hover:border-ink-400 transition-colors active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono uppercase tracking-[.12em] text-ink-400">
            {product.category}
          </span>
          <span className="text-ink-300">·</span>
          <span className="text-[12px] text-ink-500 truncate">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Image Gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-lg border border-sand-200 bg-white">
              <AnimatePresence initial={false} custom={imgDir} mode="wait">
                <motion.img
                  key={imgIdx}
                  custom={imgDir}
                  variants={imgVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  src={imgs[imgIdx]}
                  alt={`${product.name} — image ${imgIdx + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {product.isNew && (
                  <span className="rounded-full border border-accent-blue/20 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[.12em] text-accent-blue">
                    New
                  </span>
                )}
                {product.isBestseller && (
                  <span className="rounded-full border border-accent-red/20 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[.12em] text-accent-red">
                    Bestseller
                  </span>
                )}
                {off > 0 && (
                  <span className="rounded-full border border-accent-green/20 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[.12em] text-accent-green">
                    {off}% off
                  </span>
                )}
              </div>

              {/* Nav arrows */}
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => goImg(-1)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/70 backdrop-blur-sm text-ink-600 transition-all hover:bg-white active:scale-90"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goImg(1)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/70 backdrop-blur-sm text-ink-600 transition-all hover:bg-white active:scale-90"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {/* Counter */}
                  <div className="absolute bottom-3 right-3 z-10 rounded-full bg-ink-900/50 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-mono text-white">
                    {imgIdx + 1} / {imgs.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2">
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setImgDir(i > imgIdx ? 1 : -1);
                      setImgIdx(i);
                    }}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md border overflow-hidden transition-all ${
                      i === imgIdx
                        ? 'border-ink-700 ring-1 ring-ink-300'
                        : 'border-sand-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Product info ── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="flex flex-col"
          >
            <h1 className="font-serif text-2xl sm:text-3xl text-ink-900">{product.name}</h1>
            <p className="mt-0.5 text-[11px] font-mono uppercase tracking-[.12em] text-ink-400">
              {product.weight}
            </p>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="font-serif text-3xl font-semibold text-ink-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-[15px] text-ink-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="rounded-full border border-accent-green/20 bg-accent-green/5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[.1em] text-accent-green">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            <div className="h-px bg-sand-200 my-5" />

            <p className="text-[14px] text-ink-500 leading-relaxed">{product.longDescription}</p>

            {/* Features */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[
                { icon: Clock, label: `Shelf Life: ${product.shelfLife}`, color: 'text-accent-yellow' },
                { icon: Package, label: `Weight: ${product.weight}`, color: 'text-accent-blue' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 rounded-lg border border-sand-200 bg-white p-3"
                >
                  <f.icon className={`h-4 w-4 flex-shrink-0 ${f.color}`} />
                  <span className="text-[11px] font-medium text-ink-600">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Ingredients */}
            <div className="mt-5">
              <h3 className="text-[11px] font-mono uppercase tracking-[.15em] text-ink-400 mb-2">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full border border-sand-200 bg-white px-3 py-1 text-[12px] text-ink-600"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="mt-7 space-y-3">
              {qty > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono uppercase tracking-[.12em] text-ink-400">
                    Qty
                  </span>
                  <div className="inline-flex items-center rounded-full border border-sand-300 bg-white">
                    <button
                      onClick={() => updateQuantity(product.id, qty - 1)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-l-full text-ink-500 hover:bg-sand-100 active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-[13px] font-semibold text-ink-800">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, qty + 1)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-r-full text-ink-500 hover:bg-sand-100 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  onClick={doAdd}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-3 text-[13px] font-semibold tracking-wide transition-all active:scale-[0.97] ${
                    added
                      ? 'bg-accent-green text-white'
                      : 'border border-sand-300 bg-white text-ink-700 hover:border-ink-400'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={doBuy}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 py-3 text-[13px] font-semibold tracking-wide text-sand-50 transition-all hover:bg-ink-800 active:scale-[0.97]"
                >
                  <ShoppingBag className="h-4 w-4" /> Buy Now
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-sand-200 bg-white p-3.5 text-center">
              <p className="text-[12px] text-ink-500">
                Secure checkout · Ships in 2-3 days · Quality guaranteed
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
