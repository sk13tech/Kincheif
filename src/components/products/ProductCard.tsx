import { Plus, Minus, Flame } from 'lucide-react';
import { Product, CartItem } from '../../types';

interface Props {
  product: Product;
  cartItem?: CartItem;
  onAdd: (p: Product) => void;
  onUpdate: (id: string, qty: number) => void;
  onClick: (p: Product) => void;
}

export default function ProductCard({ product, cartItem, onAdd, onUpdate, onClick }: Props) {
  const qty = cartItem?.quantity || 0;
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const outOfStock = !product.inStock || product.stockQty <= 0;
  const maxReached = qty >= product.stockQty;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-anim group a-fade-up">
      <div className="relative cursor-pointer" onClick={() => onClick(product)}>
        <div className="aspect-[4/3] overflow-hidden bg-slate-50">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'grayscale brightness-75' : ''}`}
            loading="lazy"
          />
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.tags.includes('bestseller') && !outOfStock && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Bestseller</span>
          )}
          {discount > 0 && !outOfStock && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold tracking-wide shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className={`font-semibold mb-1 cursor-pointer transition-colors ${outOfStock ? 'text-slate-400' : 'text-slate-800 hover:text-emerald-600'}`} onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: product.spiceLevel }).map((_, i) => (
            <Flame key={i} className={`w-3.5 h-3.5 ${outOfStock ? 'text-slate-300' : 'text-red-500 fill-red-500'}`} />
          ))}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-lg font-bold ${outOfStock ? 'text-slate-400' : 'text-slate-800'}`}>₹{product.price}</span>
          {product.originalPrice && <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{product.weight}</span>
          {!outOfStock && product.stockQty <= 5 && (
            <span className="text-[10px] text-amber-600 font-semibold">Only {product.stockQty} left</span>
          )}
        </div>
        <div className="mt-3">
          {outOfStock ? (
            <button disabled className="w-full bg-slate-100 text-slate-400 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed">
              Out of Stock
            </button>
          ) : qty === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(product); }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold press transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> ADD
            </button>
          ) : (
            <div className="flex items-center justify-between bg-emerald-600 rounded-xl overflow-hidden">
              <button onClick={(e) => { e.stopPropagation(); onUpdate(product.id, qty - 1); }} className="px-4 py-2.5 text-white hover:bg-emerald-700 press transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-bold text-sm">{qty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); if (!maxReached) onUpdate(product.id, qty + 1); }}
                disabled={maxReached}
                className={`px-4 py-2.5 text-white press transition-colors ${maxReached ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-700'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          {qty > 0 && maxReached && (
            <p className="text-[10px] text-amber-600 text-center mt-1 font-medium">Max available qty reached</p>
          )}
        </div>
      </div>
    </div>
  );
}
