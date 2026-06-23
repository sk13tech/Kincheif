import { Plus, Minus, Star } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../store/CartContext';

interface Props {
  product: Product;
  index: number;
  onViewProduct: (p: Product) => void;
}

export default function ProductCard({ product, index, onViewProduct }: Props) {
  const { addItem, items, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity || 0;
  const off = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qty + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  return (
    <div
      onClick={() => onViewProduct(product)}
      className="group flex flex-col rounded-lg border border-sand-200 bg-white overflow-hidden cursor-pointer transition-all duration-200 hover:border-sand-400 hover:shadow-md hover:shadow-ink-900/5 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-sand-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full border border-accent-blue/20 bg-accent-blue/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[.12em] text-accent-blue">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full border border-accent-red/20 bg-accent-red/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[.12em] text-accent-red">
              Best
            </span>
          )}
          {off > 0 && (
            <span className="rounded-full border border-accent-green/20 bg-accent-green/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[.12em] text-accent-green">
              {off}% off
            </span>
          )}
        </div>
        {/* Image count indicator */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full border border-white/40 bg-ink-900/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-mono text-white">
            1/{product.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3.5 w-3.5 fill-accent-yellow text-accent-yellow" />
          <span className="text-[11px] font-semibold text-ink-700">{product.rating}</span>
          <span className="text-[11px] text-ink-400">({product.reviews})</span>
        </div>

        <h3 className="text-[13px] font-semibold text-ink-800 leading-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-ink-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[17px] font-semibold text-ink-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-ink-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-ink-400 uppercase tracking-[.1em]">
              {product.weight}
            </p>
          </div>

          {/* Quantity controls or Add button */}
          {qty > 0 ? (
            <div
              className="inline-flex items-center rounded-full border border-ink-900 bg-ink-900 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleDecrease}
                className="h-8 w-8 inline-flex items-center justify-center text-sand-50 hover:bg-ink-800 transition-colors active:scale-95"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-[13px] font-bold text-sand-50">
                {qty}
              </span>
              <button
                onClick={handleIncrease}
                className="h-8 w-8 inline-flex items-center justify-center text-sand-50 hover:bg-ink-800 transition-colors active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`h-8 inline-flex items-center gap-1 rounded-full px-3.5 text-[11px] font-semibold tracking-wide transition-all duration-150 active:scale-95 border border-sand-300 bg-white text-ink-600 hover:border-ink-500 hover:text-ink-800 ${
                !product.inStock ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
