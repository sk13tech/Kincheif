import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { validateCoupon, signInWithGoogle } from '../lib/firebase';

interface Props { onCheckout: () => void; }

export default function CartSidebar({ onCheckout }: Props) {
  const { isOpen, closeCart, items, totalItems, totalAmount, deliveryFee, updateQuantity, removeItem, clearCart, minFreeDelivery } = useCart();
  const { user } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponErr, setCouponErr] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [agreed, setAgreed] = useState(!!localStorage.getItem('purehome_consent'));
  const [signingIn, setSigningIn] = useState(false);

  const mrpTotal = items.reduce((s, i) => s + (i.product.originalPrice || i.product.price) * i.quantity, 0);
  const discount = mrpTotal - totalAmount;
  const couponDiscount = coupon?.discount || 0;
  const total = totalAmount - couponDiscount + deliveryFee;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true); setCouponErr('');
    const r = await validateCoupon(couponInput.trim(), totalAmount);
    if (r.valid && r.discountAmount) setCoupon({ code: couponInput.trim().toUpperCase(), discount: r.discountAmount });
    else setCouponErr(r.error || 'Invalid');
    setCouponLoading(false);
  };

  const saveCouponToSession = () => {
    if (coupon) sessionStorage.setItem('purehome_coupon', JSON.stringify(coupon));
    else sessionStorage.removeItem('purehome_coupon');
  };

  const handleCheckout = () => {
    if (user) {
      // Already signed in → go to checkout
      saveCouponToSession();
      closeCart();
      onCheckout();
      return;
    }
    // Not signed in → check consent
    if (!localStorage.getItem('purehome_consent')) {
      setShowConsent(true);
      return;
    }
    // Has consent → sign in directly
    doSignInAndCheckout();
  };

  const doConsentAndCheckout = () => {
    if (!agreed) return;
    localStorage.setItem('purehome_consent', 'true');
    setShowConsent(false);
    doSignInAndCheckout();
  };

  const doSignInAndCheckout = async () => {
    setSigningIn(true);
    const u = await signInWithGoogle();
    setSigningIn(false);
    if (u) {
      saveCouponToSession();
      closeCart();
      onCheckout();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink-900/15 backdrop-blur-sm" onClick={closeCart} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-sand-50 border-l border-sand-200 shadow-xl flex flex-col">

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-sand-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-ink-700" />
                <span className="text-[14px] font-semibold text-ink-800">Cart</span>
                {totalItems > 0 && <span className="h-5 min-w-5 inline-flex items-center justify-center rounded-full bg-ink-900 px-1.5 text-[9px] font-bold text-sand-50">{totalItems}</span>}
              </div>
              <button onClick={closeCart} className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-sand-200 bg-white text-ink-400 hover:text-ink-700 active:scale-95"><X className="h-3.5 w-3.5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <ShoppingBag className="h-8 w-8 text-ink-300 mb-3" />
                  <p className="font-serif text-base italic text-ink-400">Your cart is empty</p>
                  <button onClick={closeCart} className="mt-4 rounded-full bg-ink-900 px-4 py-2 text-[11px] font-semibold text-sand-50 active:scale-95">Browse Products</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-2.5 rounded-lg border border-sand-200 bg-white p-2.5">
                      <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-md object-cover flex-shrink-0 border border-sand-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-semibold text-ink-800 truncate">{item.product.name}</h4>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[11px] font-semibold text-ink-700">₹{item.product.price}</span>
                          {item.product.originalPrice && <span className="text-[9px] text-ink-400 line-through">₹{item.product.originalPrice}</span>}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-6 w-6 inline-flex items-center justify-center text-ink-500 hover:bg-sand-200 active:scale-95"><Minus className="h-2.5 w-2.5" /></button>
                            <span className="w-6 text-center text-[10px] font-bold text-ink-800">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-6 w-6 inline-flex items-center justify-center text-ink-500 hover:bg-sand-200 active:scale-95"><Plus className="h-2.5 w-2.5" /></button>
                          </div>
                          <span className="font-serif text-[12px] font-semibold text-ink-800">₹{item.product.price * item.quantity}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="h-6 w-6 inline-flex items-center justify-center rounded-full text-ink-300 hover:text-accent-red self-start flex-shrink-0 active:scale-95"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button onClick={clearCart} className="text-[10px] font-medium text-accent-red hover:underline">Clear all</button>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-sand-200 px-5 py-4 space-y-3">
                {/* Coupon */}
                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  {coupon ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><Tag className="h-3 w-3 text-accent-green" /><span className="text-[11px] font-bold text-accent-green">{coupon.code} −₹{coupon.discount}</span></div>
                      <button onClick={() => setCoupon(null)} className="text-[10px] text-accent-red">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(''); }} placeholder="Coupon code"
                        className="flex-1 rounded-md border border-sand-200 px-2.5 py-1.5 text-[11px] font-mono outline-none focus:border-ink-400" />
                      <button onClick={applyCoupon} disabled={couponLoading} className="rounded-full bg-ink-900 px-3 py-1.5 text-[10px] font-semibold text-sand-50 active:scale-95 disabled:opacity-50">
                        {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponErr && <p className="mt-1 text-[9px] text-accent-red">{couponErr}</p>}
                </div>

                {/* Price breakdown */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px] text-ink-500"><span>Total MRP</span><span>₹{mrpTotal}</span></div>
                  {discount > 0 && <div className="flex justify-between text-[11px] text-accent-green font-medium"><span>Discount</span><span>−₹{discount}</span></div>}
                  {couponDiscount > 0 && <div className="flex justify-between text-[11px] text-accent-green font-medium"><span>Coupon Saving</span><span>−₹{couponDiscount}</span></div>}
                  <div className="flex justify-between text-[12px] text-ink-500"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-accent-green font-medium' : ''}>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span></div>
                  {deliveryFee > 0 && totalAmount < minFreeDelivery && <p className="text-[10px] text-accent-yellow font-medium">Add ₹{minFreeDelivery - totalAmount} more to get free delivery</p>}
                  <div className="h-px bg-sand-200 my-1" />
                  <div className="flex justify-between text-[15px] font-bold text-ink-900"><span>Total</span><span className="font-serif">₹{total}</span></div>
                  {(discount + couponDiscount) > 0 && <p className="text-[10px] text-accent-green text-center">You save ₹{discount + couponDiscount}</p>}
                </div>

                <div className="flex items-start gap-1.5 text-[9px] text-ink-400">
                  <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>Cancel before processing. Replacement within 3 days of delivery.</span>
                </div>

                <button onClick={handleCheckout} disabled={signingIn}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 py-3 text-[13px] font-semibold tracking-wide text-sand-50 hover:bg-ink-800 active:scale-[0.97] disabled:opacity-60">
                  {signingIn ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> :
                    user ? <><span>Checkout</span><ArrowRight className="h-3.5 w-3.5" /></> : <><span>Sign in to Checkout</span></>}
                </button>
              </div>
            )}

            {/* Consent modal */}
            <AnimatePresence>
              {showConsent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 bg-ink-900/40 flex items-end">
                  <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="w-full bg-white rounded-t-2xl p-5 space-y-4">
                    <h3 className="font-serif text-lg text-ink-900">Before you continue</h3>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-ink-900" />
                      <span className="text-[12px] text-ink-600 leading-relaxed">I agree to the Privacy Policy and Terms & Conditions</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => setShowConsent(false)} className="flex-1 rounded-full border border-sand-300 py-2.5 text-[12px] font-semibold text-ink-600">Cancel</button>
                      <button onClick={doConsentAndCheckout} disabled={!agreed || signingIn}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 py-2.5 text-[12px] font-semibold text-sand-50 disabled:opacity-40">
                        {signingIn ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Sign in & Checkout'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
