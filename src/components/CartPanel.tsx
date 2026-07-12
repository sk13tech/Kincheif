import { useState, useEffect } from 'react';
import { CartActions } from '../lib/useCart';
import { OrderActions } from '../lib/useOrders';
import { useConfig, useCoupons, useGiftCards, CouponItem, GiftCardItem } from '../lib/useSettings';
import { sanitizeCode, sanitizeUTR, isValidUTR } from '../lib/sanitize';
import { useAddress, validateAddress, emptyAddress, Address, INDIAN_STATES } from '../lib/useAddress';
import { User } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartActions;
  orders: OrderActions;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  user: User | null;
}

const ico: React.CSSProperties = { fill: 'none', stroke: 'var(--icon)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' };
const inpS: React.CSSProperties = { width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-sec)', color: 'var(--text)', fontSize: '.78rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

type Step = 'cart' | 'address' | 'payment' | 'success';

export default function CartPanel({ isOpen, onClose, cart, orders, isLoggedIn, onLoginClick, user }: Props) {
  const config = useConfig();
  const coupons = useCoupons();
  const giftCards = useGiftCards();
  const { saved: savedAddr, save: saveAddr } = useAddress(user);

  const [step, setStep] = useState<Step>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [couponError, setCouponError] = useState('');
  const [giftInput, setGiftInput] = useState('');
  const [appliedGift, setAppliedGift] = useState<GiftCardItem | null>(null);
  const [giftError, setGiftError] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Address
  const [addr, setAddr] = useState<Address>(emptyAddress);
  const [addrError, setAddrError] = useState('');
  const [saveAddrCheck, setSaveAddrCheck] = useState(true);

  // Pre-fill saved address
  useEffect(() => {
    if (savedAddr && step === 'cart') setAddr(savedAddr);
  }, [savedAddr, step]);

  const freeMin = config?.freeDeliveryMin ?? 999;
  const deliveryRate = config?.deliveryCharge ?? 49;
  const upiId = config?.upiId ?? '';
  const subtotal = cart.totalPrice;
  const isFreeDelivery = subtotal >= freeMin;
  const delivery = cart.cartItems.length > 0 ? (isFreeDelivery ? 0 : deliveryRate) : 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = appliedCoupon.type === 'percent'
      ? Math.min(Math.round(subtotal * appliedCoupon.value / 100), appliedCoupon.maxDiscount)
      : Math.min(appliedCoupon.value, appliedCoupon.maxDiscount);
  }
  const afterCoupon = subtotal - couponDiscount + delivery;
  const giftUsed = appliedGift ? Math.min(appliedGift.balance, afterCoupon) : 0;
  const amountToPay = Math.max(afterCoupon - giftUsed, 0);
  const grandTotal = afterCoupon;

  const applyCoupon = () => {
    setCouponError('');
    const code = sanitizeCode(couponInput);
    if (!code) { setCouponError('Enter a coupon code'); return; }
    const found = coupons.find(c => c.code === code);
    if (!found) { setCouponError('Invalid coupon code'); return; }
    if (!found.active) { setCouponError('This coupon has expired'); return; }
    if (subtotal < found.minOrder) { setCouponError(`Min order ₹${found.minOrder} required`); return; }
    setAppliedCoupon(found);
  };
  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(''); setCouponError(''); };

  const applyGift = () => {
    setGiftError('');
    const code = sanitizeCode(giftInput);
    if (!code) { setGiftError('Enter a gift card code'); return; }
    const found = giftCards.find(g => g.code === code);
    if (!found) { setGiftError('Invalid gift card code'); return; }
    if (!found.active) { setGiftError('This gift card is no longer active'); return; }
    if (found.balance <= 0) { setGiftError('This gift card has been fully used (₹0 balance)'); return; }
    setAppliedGift(found);
  };
  const removeGift = () => { setAppliedGift(null); setGiftInput(''); setGiftError(''); };

  const goToAddress = () => {
    if (!isLoggedIn) { onLoginClick(); return; }
    if (cart.cartItems.length === 0) return;
    if (savedAddr) setAddr(savedAddr);
    setStep('address');
  };

  const goToPayment = async () => {
    const err = validateAddress(addr);
    if (err) { setAddrError(err); return; }
    setAddrError('');
    if (saveAddrCheck) await saveAddr(addr);
    setStep('payment');
  };

  const placeOrder = async () => {
    setUtrError('');
    if (amountToPay > 0) {
      if (!isValidUTR(sanitizeUTR(utrInput))) { setUtrError('Enter a valid UTR / transaction number (6-30 alphanumeric characters)'); return; }
    }
    if (placing) return;
    setPlacing(true);
    try {
      const id = await orders.placeOrder({
        cartItems: cart.cartItems, subtotal,
        couponCode: appliedCoupon?.code || '', couponDiscount,
        giftCardCode: appliedGift?.code || '', giftCardUsed: giftUsed,
        delivery, total: grandTotal, amountPaid: amountToPay,
        utrNumber: sanitizeUTR(utrInput), address: addr,
      });
      if (id) { setOrderId(id); cart.clear(); setStep('success'); }
    } catch { }
    setPlacing(false);
  };

  const reset = () => {
    setStep('cart'); setCouponInput(''); setAppliedCoupon(null); setCouponError('');
    setGiftInput(''); setAppliedGift(null); setGiftError('');
    setUtrInput(''); setUtrError(''); setOrderId(null);
    setAddrError(''); onClose();
  };

  const setField = (k: keyof Address, v: string) => setAddr(p => ({ ...p, [k]: v }));

  // Header title & back
  const titles: Record<Step, string> = { cart: 'Cart', address: 'Delivery', payment: 'Payment', success: 'Confirmed' };
  const backStep: Record<Step, Step | null> = { cart: null, address: 'cart', payment: 'address', success: null };

  return (
    <>
      <div className={`nav-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className="card-gpu" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 100, width: 360, maxWidth: '90vw', background: 'var(--bg)', borderLeft: '1px solid var(--border)', transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .3s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-h)', padding: '0 8px 0 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>
            {titles[step]}
            {step === 'cart' && cart.totalQty > 0 && <span style={{ fontWeight: 500, fontSize: '.78rem', color: 'var(--text-sec)' }}> ({cart.totalQty})</span>}
          </span>
          <button className="h-btn" aria-label="Close" onClick={backStep[step] ? () => setStep(backStep[step]!) : reset}>
            <svg viewBox="0 0 24 24" style={{ ...ico, width: 22, height: 22 }}>
              {backStep[step] ? <path d="M15 19l-7-7 7-7" /> : <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>}
            </svg>
          </button>
        </div>

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '1.4rem' }}>⏳</span></div>
            <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)' }}>Order received!</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-sec)', textAlign: 'center' }}>Order #{orderId?.slice(-6).toUpperCase()}<br />Payment verification pending.</div>
            <button onClick={reset} style={{ marginTop: 8, padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Continue shopping</button>
          </div>
        )}

        {/* ── ADDRESS ── */}
        {step === 'address' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Delivery Address</div>

            {savedAddr && addr.name !== savedAddr.name && (
              <button onClick={() => setAddr(savedAddr)} style={{ marginBottom: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.74rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}>
                Use saved address: {savedAddr.name}, {savedAddr.city}
              </button>
            )}

            <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Full Name *</label>
                <input value={addr.name} onChange={e => setField('name', e.target.value)} placeholder="John Doe" style={inpS} maxLength={100} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Phone *</label>
                <input value={addr.phone} onChange={e => setField('phone', e.target.value.replace(/[^0-9+]/g, ''))} placeholder="9876543210" style={inpS} maxLength={15} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Address Line 1 *</label>
                <input value={addr.line1} onChange={e => setField('line1', e.target.value)} placeholder="House/Flat no, Building, Street" style={inpS} maxLength={200} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Address Line 2</label>
                <input value={addr.line2} onChange={e => setField('line2', e.target.value)} placeholder="Landmark (optional)" style={inpS} maxLength={200} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>City *</label>
                  <input value={addr.city} onChange={e => setField('city', e.target.value)} placeholder="Mumbai" style={inpS} maxLength={50} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Pincode *</label>
                  <input value={addr.pincode} onChange={e => setField('pincode', e.target.value.replace(/[^0-9]/g, ''))} placeholder="400001" style={inpS} maxLength={6} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>State *</label>
                <select value={addr.state} onChange={e => setField('state', e.target.value)} style={{ ...inpS, appearance: 'auto' }}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.74rem', color: 'var(--text-sec)', marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={saveAddrCheck} onChange={e => setSaveAddrCheck(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--text)' }} />
              Save this address for future orders
            </label>

            {addrError && <div style={{ fontSize: '.72rem', color: '#e74c3c', marginBottom: 10 }}>{addrError}</div>}

            <button onClick={goToPayment} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Continue to payment
            </button>
          </div>
        )}

        {/* ── PAYMENT ── */}
        {step === 'payment' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', WebkitOverflowScrolling: 'touch' }}>
            {/* Delivery summary */}
            <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: '.74rem', color: 'var(--text-sec)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>Delivering to</div>
              <div>{addr.name}, {addr.phone}</div>
              <div>{addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}</div>
              <div>{addr.city}, {addr.state} — {addr.pincode}</div>
              <button onClick={() => setStep('address')} style={{ marginTop: 6, border: 'none', background: 'none', color: '#0b57cf', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Change</button>
            </div>

            {/* Bill summary */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Order Summary</div>
              <BillRow l="Subtotal" r={`₹${subtotal.toLocaleString('en-IN')}`} />
              {couponDiscount > 0 && <BillRow l={`Coupon (${appliedCoupon?.code})`} r={`−₹${couponDiscount.toLocaleString('en-IN')}`} green />}
              <BillRow l="Delivery" r={delivery === 0 ? 'FREE' : `₹${delivery}`} green={delivery === 0} />
              {giftUsed > 0 && <BillRow l={`Gift Card (${appliedGift?.code})`} r={`−₹${giftUsed.toLocaleString('en-IN')}`} green />}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>Amount to pay</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{amountToPay.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Gift card */}
            {!appliedGift ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Have a gift card?</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={giftInput} onChange={e => setGiftInput(sanitizeCode(e.target.value))} placeholder="Enter code" style={{ ...inpS, flex: 1 }} maxLength={20} />
                  <button onClick={applyGift} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Apply</button>
                </div>
                {giftError && <div style={{ fontSize: '.72rem', color: '#e74c3c', marginTop: 4 }}>{giftError}</div>}
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 8, background: '#f0faf3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.78rem', color: '#27ae60', fontWeight: 600 }}>🎁 {appliedGift.code} — ₹{giftUsed} used (bal: ₹{appliedGift.balance})</span>
                <button onClick={removeGift} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '.72rem', color: '#e74c3c', fontFamily: 'inherit' }}>Remove</button>
              </div>
            )}

            {/* UPI */}
            {amountToPay > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Pay via UPI</div>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Store&am=${amountToPay}&cu=INR`)}`} alt="UPI QR" loading="lazy" decoding="async" style={{ width: 160, height: 160, borderRadius: 10, border: '1px solid var(--border)', display: 'inline-block' }} />
                  <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 6 }}>Scan to pay ₹{amountToPay.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-sec)', marginTop: 2, fontFamily: 'monospace' }}>{upiId}</div>
                </div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Enter UTR / Transaction ID</div>
                <input value={utrInput} onChange={e => setUtrInput(sanitizeUTR(e.target.value))} placeholder="e.g. 412345678901" style={{ ...inpS, marginBottom: 4 }} maxLength={30} />
                {utrError && <div style={{ fontSize: '.72rem', color: '#e74c3c', marginTop: 2 }}>{utrError}</div>}
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '14px', borderRadius: 10, background: '#f0faf3', textAlign: 'center' }}>
                <div style={{ fontSize: '.84rem', fontWeight: 600, color: '#27ae60' }}>Fully paid by Gift Card!</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 4 }}>No UPI payment needed</div>
              </div>
            )}

            <button onClick={placeOrder} disabled={placing} style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '.84rem', fontWeight: 600, cursor: placing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: placing ? .6 : 1 }}>
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        )}

        {/* ── CART ── */}
        {step === 'cart' && (
          cart.cartItems.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <svg viewBox="0 0 24 24" style={{ ...ico, width: 48, height: 48, opacity: .12 }}><path d="M7.5 7.67V6.7c0-2.25 1.81-4.46 4.06-4.67a4.5 4.5 0 014.94 4.48v1.38" /><path d="M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22z" /><path d="M15.5 12h.01" /><path d="M8.5 12h.01" /></svg>
              <span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>Your cart is empty</span>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', WebkitOverflowScrolling: 'touch' }}>
                {cart.cartItems.map(({ product: p, qty }) => (
                  <div key={p.id} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                      {p.image && <img src={p.image} alt={p.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{p.title}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                        <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                        {p.mrp > p.price && <span style={{ fontSize: '.62rem', color: 'var(--text-sec)', textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 6, border: '1px solid var(--border)' }}>
                          <button onClick={() => cart.dec(p.id)} style={{ width: 28, height: 26, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '.9rem', fontWeight: 600, fontFamily: 'inherit' }}>−</button>
                          <span style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text)', minWidth: 18, textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => cart.inc(p.id)} style={{ width: 28, height: 26, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '.9rem', fontWeight: 600, fontFamily: 'inherit' }}>+</button>
                        </div>
                        <button onClick={() => cart.remove(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text-sec)' }}>
                          <svg viewBox="0 0 24 24" style={{ ...ico, width: 16, height: 16, stroke: 'var(--text-sec)' }}><path d="M21 5.98c-3.33-.33-6.68-.5-10.02-.5-1.98 0-3.96.1-5.94.3L3 5.98" /><path d="M8.5 4.97l.22-1.31C8.88 2.71 9 2 10.69 2h2.62c1.69 0 1.82.75 1.97 1.67l.22 1.3" /><path d="M18.85 9.14l-.65 10.07C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', flexShrink: 0 }}>
                {!appliedCoupon ? (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={couponInput} onChange={e => setCouponInput(sanitizeCode(e.target.value))} placeholder="Coupon code" style={{ ...inpS, flex: 1 }} maxLength={20} />
                      <button onClick={applyCoupon} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.74rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Apply</button>
                    </div>
                    {couponError && <div style={{ fontSize: '.7rem', color: '#e74c3c', marginTop: 3 }}>{couponError}</div>}
                  </div>
                ) : (
                  <div style={{ marginBottom: 10, padding: '7px 10px', borderRadius: 8, background: '#f0faf3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.76rem', color: '#27ae60', fontWeight: 600 }}>🏷 {appliedCoupon.code} — ₹{couponDiscount} off</span>
                    <button onClick={removeCoupon} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '.7rem', color: '#e74c3c', fontFamily: 'inherit' }}>Remove</button>
                  </div>
                )}
                {!isFreeDelivery && <div style={{ fontSize: '.7rem', color: '#27ae60', marginBottom: 8, padding: '6px 10px', borderRadius: 8, background: '#f0faf3', fontWeight: 500 }}>Add ₹{(freeMin - subtotal).toLocaleString('en-IN')} more for free delivery</div>}
                <BillRow l={`Subtotal (${cart.totalQty} items)`} r={`₹${subtotal.toLocaleString('en-IN')}`} />
                {cart.totalSaved > 0 && <BillRow l="You save" r={`−₹${cart.totalSaved.toLocaleString('en-IN')}`} green />}
                {couponDiscount > 0 && <BillRow l="Coupon discount" r={`−₹${couponDiscount.toLocaleString('en-IN')}`} green />}
                <BillRow l="Delivery" r={delivery === 0 ? 'FREE' : `₹${delivery}`} green={delivery === 0} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)' }}>Total</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={goToAddress} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {!isLoggedIn ? 'Login to checkout' : `Checkout · ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}

function BillRow({ l, r, green }: { l: string; r: string; green?: boolean }) {
  return <div style={{ fontSize: '.76rem', color: green ? '#27ae60' : 'var(--text-sec)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}><span>{l}</span><span style={{ fontWeight: 600, color: green ? '#27ae60' : 'var(--text)' }}>{r}</span></div>;
}
