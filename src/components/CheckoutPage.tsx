import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShieldCheck, Check, Loader2, Package, Gift, MapPin, Trash2, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { saveOrder, validateGiftCard, getSavedAddresses, saveAddress, deleteAddress, validatePincode, subscribeSiteConfig, type SavedAddress, type SiteConfig } from '../lib/firebase';
import { sanitize, sanitizeEmail, sanitizePhone, sanitizePincode, isValidIndianPhone, isValidEmail, isValidAddress, safeJsonParse } from '../lib/security';
import type { CustomerInfo } from '../types';

interface Props { onBack: () => void; onOrderPlaced: (id: string) => void; }

export default function CheckoutPage({ onBack, onOrderPlaced }: Props) {
  const { items, totalAmount, deliveryFee, clearCart } = useCart();
  const [siteCfg, setSiteCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setSiteCfg), []);
  const { user } = useAuth();
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [busy, setBusy] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [errs, setErrs] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [info, setInfo] = useState<CustomerInfo>({ name: user?.displayName || '', email: user?.email || '', phone: '', address: '', city: '', state: '', pincode: '', notes: '' });
  const [pinValid, setPinValid] = useState<boolean | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [coupon] = useState<{ code: string; discount: number } | null>(() => {
    return safeJsonParse(sessionStorage.getItem('purehome_coupon'), null);
  });
  const [gcInput, setGcInput] = useState('');
  const [gc, setGc] = useState<{ code: string; balance: number; used: number } | null>(null);
  const [gcLoading, setGcLoading] = useState(false);
  const [gcErr, setGcErr] = useState('');

  const [savedAddrs, setSavedAddrs] = useState<SavedAddress[]>([]);
  const [showSaveAddr, setShowSaveAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');

  const mrpTotal = items.reduce((s, i) => s + (i.product.originalPrice || i.product.price) * i.quantity, 0);
  const discount = mrpTotal - totalAmount;
  const couponDiscount = coupon?.discount || 0;
  const afterCoupon = totalAmount - couponDiscount;
  const gcUsed = gc ? Math.min(gc.used, afterCoupon + deliveryFee) : 0;
  const payable = Math.max(0, afterCoupon + deliveryFee - gcUsed);

  useEffect(() => { if (user) getSavedAddresses(user.uid).then(setSavedAddrs); }, [user]);

  // Update a single field without re-creating the whole form
  const updateField = (f: keyof CustomerInfo, v: string) => {
    const cleaned = f === 'phone' ? sanitizePhone(v) : f === 'email' ? sanitizeEmail(v) || v : f === 'pincode' ? sanitizePincode(v) : sanitize(v);
    setInfo(prev => ({ ...prev, [f]: cleaned }));
    if (errs[f]) setErrs(prev => ({ ...prev, [f]: undefined }));
  };

  // Debounced pincode validation
  const updatePincode = (v: string) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 6);
    setInfo(prev => ({ ...prev, pincode: cleaned }));
    if (errs.pincode) setErrs(prev => ({ ...prev, pincode: undefined }));
    setPinValid(null);
    if (pinTimer.current) clearTimeout(pinTimer.current);
    if (cleaned.length === 6) {
      pinTimer.current = setTimeout(async () => {
        setPinLoading(true);
        const r = await validatePincode(cleaned);
        setPinValid(r.valid);
        if (r.valid && r.city && r.state) setInfo(prev => ({ ...prev, city: r.city!, state: r.state! }));
        setPinLoading(false);
      }, 300);
    }
  };

  const validate = () => {
    const e: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!info.name || info.name.length < 2) e.name = 'Required';
    if (!isValidEmail(info.email)) e.email = 'Invalid';
    if (!isValidIndianPhone(info.phone)) e.phone = 'Invalid phone';
    if (!isValidAddress(info.address)) e.address = 'Required';
    if (!info.city) e.city = 'Required';
    if (!info.state) e.state = 'Required';
    if (!info.pincode || info.pincode.length !== 6) e.pincode = 'Invalid';
    if (pinValid === false) e.pincode = 'Invalid pincode';
    setErrs(e); return Object.keys(e).length === 0;
  };

  const applyGC = async () => {
    if (!gcInput.trim()) return;
    setGcLoading(true); setGcErr('');
    const r = await validateGiftCard(gcInput.trim());
    if (r.valid && r.card) setGc({ code: gcInput.trim().toUpperCase(), balance: r.card.balance, used: Math.min(r.card.balance, afterCoupon + deliveryFee) });
    else setGcErr(r.error || 'Invalid');
    setGcLoading(false);
  };

  const loadAddr = (a: SavedAddress) => { setInfo({ name: a.name, email: a.email, phone: a.phone, address: a.address, city: a.city, state: a.state, pincode: a.pincode, notes: a.notes || '' }); setPinValid(true); };
  const doSaveAddr = async () => { if (user && info.address) { const id = await saveAddress(user.uid, info, addrLabel); if (id) setSavedAddrs(p => [...p, { ...info, id, label: addrLabel }]); setShowSaveAddr(false); } };

  const [showPaid, setShowPaid] = useState(false);
  const [qrTimer, setQrTimer] = useState(300); // 5 minutes in seconds

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start QR timer when payment step loads
  useEffect(() => {
    if (step === 'payment' && payable > 0) {
      setQrTimer(300);
      timerRef.current = setInterval(() => setQrTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; }), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [step, payable]);

  // Order only created when user submits txn ID — no AWAITING_PAYMENT orders

  const completeOrder = async () => {
    if (!user?.uid) return;
    if (payable > 0 && (txnId.length < 4 || txnId.length > 20)) return;
    if (items.length === 0) return;
    setBusy(true);
    try {
      const txn = txnId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      const oid = await saveOrder(
        { items, customer: info, paymentMethod: 'upi', transactionId: payable === 0 ? 'GIFTCARD' : txn, totalAmount: payable, status: 'pending',
          couponCode: coupon?.code, couponDiscount, giftCardCode: gc?.code, giftCardUsed: gcUsed, mrpTotal, productDiscount: discount },
        { uid: user.uid, email: user.email || null, displayName: user.displayName || null },
      );
      sessionStorage.removeItem('purehome_coupon');
      clearCart();
      onOrderPlaced(oid);
    } catch { alert('Order failed. Check your connection and try again.'); }
    finally { setBusy(false); }
  };

  const fmtTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Build UPI string — replace am= value with actual amount
  function buildUpiWithAmount(template: string, amount: number): string {
    if (!template) return '';
    // If template has am= parameter, replace its value
    if (template.includes('am=')) {
      return template.replace(/am=[^&]*/i, `am=${amount}`);
    }
    // If no am= parameter, append it
    return template + (template.includes('?') ? '&' : '?') + `am=${amount}`;
  }
  const upiData = buildUpiWithAmount(siteCfg.upiTemplate || '', payable);
  const qrUrl = upiData ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiData)}` : '';

  // Reusable input class
  const ic = (f: keyof CustomerInfo) => `w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] outline-none focus:ring-1 ${errs[f] ? 'border-accent-red/50 focus:ring-accent-red/20' : 'border-sand-300 focus:border-ink-400 focus:ring-ink-200'}`;
  const lbl = "block text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-sand-50 pt-14">
      <div className="sticky top-14 z-10 bg-sand-50/90 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-lg px-4 py-2.5 flex items-center gap-2.5">
          <button onClick={step === 'info' ? onBack : () => setStep('info')} className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-300 bg-white text-ink-500 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <span className="text-[14px] font-semibold text-ink-800">Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-7">
          {['Delivery', 'Payment'].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`h-6 w-6 inline-flex items-center justify-center rounded-full text-[9px] font-bold ${i <= ['info', 'payment'].indexOf(step) ? 'bg-ink-900 text-sand-50' : 'border border-sand-300 text-ink-400'}`}>
                {i < ['info', 'payment'].indexOf(step) ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium ${i <= ['info', 'payment'].indexOf(step) ? 'text-ink-800' : 'text-ink-400'}`}>{s}</span>
              {i < 1 && <div className={`w-8 h-px mx-1 ${['info', 'payment'].indexOf(step) > 0 ? 'bg-ink-900' : 'bg-sand-300'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 'info' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {savedAddrs.length > 0 && (
              <div className="rounded-lg border border-sand-200 bg-white p-4">
                <p className="text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> Saved Addresses</p>
                {savedAddrs.map(a => (
                  <div key={a.id} className="flex items-center gap-2 mb-2 last:mb-0">
                    <button onClick={() => loadAddr(a)} className="flex-1 text-left rounded-lg border border-sand-200 p-2.5 hover:border-ink-400 active:scale-[0.99]">
                      <p className="text-[11px] font-semibold text-ink-800">{a.label} · {a.name}</p>
                      <p className="text-[10px] text-ink-400 truncate">{a.address}, {a.city} – {a.pincode}</p>
                    </button>
                    <button onClick={() => deleteAddress(a.id).then(() => setSavedAddrs(p => p.filter(x => x.id !== a.id)))} className="h-7 w-7 inline-flex items-center justify-center rounded-full text-ink-300 hover:text-accent-red active:scale-95"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-sand-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className={lbl} style={{ marginBottom: 0 }}>Delivery Details</p>
                {info.address && !showSaveAddr && <button onClick={() => setShowSaveAddr(true)} className="text-[10px] text-accent-blue font-medium flex items-center gap-1"><Plus className="h-3 w-3" /> Save</button>}
              </div>
              {showSaveAddr && (
                <div className="flex gap-2 items-center bg-sand-50 rounded-lg p-2.5">
                  <input value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder="Label" className="flex-1 rounded border border-sand-300 px-2 py-1.5 text-[12px] outline-none" />
                  <button onClick={doSaveAddr} className="rounded-full bg-ink-900 px-3 py-1.5 text-[10px] font-semibold text-sand-50">Save</button>
                  <button onClick={() => setShowSaveAddr(false)} className="text-[10px] text-ink-400">Cancel</button>
                </div>
              )}

              {/* ALL INPUTS INLINE — no Field component that remounts */}
              <div>
                <label className={lbl}>Full Name</label>
                <input value={info.name} onChange={e => updateField('name', e.target.value)} placeholder="Your name" className={ic('name')} />
                {errs.name && <p className="mt-0.5 text-[10px] text-accent-red">{errs.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" value={info.email} onChange={e => updateField('email', e.target.value)} placeholder="email@example.com" className={ic('email')} />
                  {errs.email && <p className="mt-0.5 text-[10px] text-accent-red">{errs.email}</p>}
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input inputMode="numeric" value={info.phone} onChange={e => updateField('phone', e.target.value)} placeholder="9876543210" maxLength={10} className={ic('phone')} />
                  {errs.phone && <p className="mt-0.5 text-[10px] text-accent-red">{errs.phone}</p>}
                </div>
              </div>
              <div>
                <label className={lbl}>Address</label>
                <input value={info.address} onChange={e => updateField('address', e.target.value)} placeholder="House/Flat, Street" className={ic('address')} />
                {errs.address && <p className="mt-0.5 text-[10px] text-accent-red">{errs.address}</p>}
              </div>
              <div>
                <label className={lbl}>Pincode</label>
                <div className="relative">
                  <input inputMode="numeric" value={info.pincode} onChange={e => updatePincode(e.target.value)} placeholder="400001" maxLength={6} className={ic('pincode')} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {pinLoading ? <Loader2 className="h-4 w-4 animate-spin text-ink-400" /> : pinValid === true ? <CheckCircle className="h-4 w-4 text-accent-green" /> : pinValid === false ? <span className="text-[10px] text-accent-red font-bold">✕</span> : null}
                  </div>
                </div>
                {errs.pincode && <p className="mt-0.5 text-[10px] text-accent-red">{errs.pincode}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={lbl}>City</label>
                  <input value={info.city} onChange={e => updateField('city', e.target.value)} placeholder="City" className={ic('city')} />
                  {errs.city && <p className="mt-0.5 text-[10px] text-accent-red">{errs.city}</p>}
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <input value={info.state} onChange={e => updateField('state', e.target.value)} placeholder="State" className={ic('state')} />
                  {errs.state && <p className="mt-0.5 text-[10px] text-accent-red">{errs.state}</p>}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-lg border border-sand-200 bg-white p-4 space-y-1.5 text-[12px]">
              <div className="flex justify-between text-ink-500"><span>Total MRP</span><span>₹{mrpTotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-accent-green font-medium"><span>Discount</span><span>−₹{discount}</span></div>}
              {couponDiscount > 0 && <div className="flex justify-between text-accent-green font-medium"><span>Coupon ({coupon?.code})</span><span>−₹{couponDiscount}</span></div>}
              <div className="flex justify-between text-ink-500"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-accent-green font-medium' : ''}>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span></div>
              <div className="h-px bg-sand-100" />
              <div className="flex justify-between text-[14px] font-bold text-ink-900"><span>Total</span><span className="font-serif">₹{afterCoupon + deliveryFee}</span></div>
            </div>

            <button onClick={() => { if (validate()) setStep('payment'); }} className="w-full rounded-full bg-ink-900 py-3 text-[13px] font-semibold text-sand-50 active:scale-[0.97]">Continue to Payment</button>
          </motion.div>
        )}

        {/* Step 2: Payment + Place */}
        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-lg border border-sand-200 bg-white p-4">
              <p className="text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-2 flex items-center gap-1"><Gift className="h-3 w-3" /> Gift Card</p>
              {gc ? (
                <div className="rounded-lg bg-accent-teal/5 border border-accent-teal/20 px-3 py-2.5">
                  <div className="flex items-center justify-between"><div><p className="text-[12px] font-bold text-accent-teal">{gc.code}</p><p className="text-[10px] text-ink-500">Using ₹{gcUsed} of ₹{gc.balance}</p></div><button onClick={() => setGc(null)} className="text-[10px] text-accent-red">Remove</button></div>
                  {gc.balance - gcUsed > 0 && <p className="text-[10px] text-accent-teal mt-1">₹{gc.balance - gcUsed} saved for next order</p>}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={gcInput} onChange={e => { setGcInput(e.target.value.toUpperCase()); setGcErr(''); }} placeholder="Gift card code" maxLength={20} className="flex-1 rounded-lg border border-sand-300 px-3 py-2 text-[13px] font-mono outline-none focus:border-ink-400" />
                  <button onClick={applyGC} disabled={gcLoading} className="rounded-full bg-ink-900 px-4 py-2 text-[11px] font-semibold text-sand-50 active:scale-95 disabled:opacity-50">{gcLoading ? '…' : 'Apply'}</button>
                </div>
              )}
              {gcErr && <p className="mt-1 text-[10px] text-accent-red">{gcErr}</p>}
            </div>

            {payable === 0 ? (
              <div className="rounded-2xl border-2 border-accent-green/30 bg-accent-green/5 p-6 text-center">
                <Gift className="h-10 w-10 text-accent-green mx-auto mb-3" />
                <p className="font-serif text-xl font-bold text-ink-900">Covered by Gift Card</p>
              </div>
            ) : !showPaid ? (
              /* ── QR Payment Screen ── */
              <div className="rounded-2xl border border-sand-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="bg-ink-900 px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ShieldCheck className="h-4 w-4 text-accent-green" />
                    <p className="text-[10px] font-mono uppercase tracking-[.15em] text-sand-300">Secure UPI Payment</p>
                  </div>
                  <p className="font-serif text-3xl font-bold text-white">₹{payable}</p>
                </div>

                <div className="p-6 text-center space-y-4">
                  {qrTimer > 0 && qrUrl ? (
                    <>
                      <div className="inline-block rounded-xl border border-sand-200 p-2 bg-white shadow-sm">
                        <img src={qrUrl} alt="UPI QR" className="h-[200px] w-[200px] sm:h-[230px] sm:w-[230px]" />
                      </div>
                      <div>
                        <p className="text-[11px] text-ink-500">Scan with any UPI app</p>
                        <p className={`text-[12px] font-mono font-semibold mt-1 ${qrTimer < 60 ? 'text-accent-red' : 'text-ink-400'}`}>{fmtTimer(qrTimer)}</p>
                      </div>
                    </>
                  ) : qrTimer <= 0 ? (
                    <div className="py-6">
                      <p className="text-[13px] text-accent-red font-semibold">QR Expired</p>
                      <button onClick={() => setQrTimer(300)} className="mt-2 rounded-full border border-sand-300 px-4 py-1.5 text-[11px] font-semibold text-ink-600 active:scale-95">Refresh QR</button>
                    </div>
                  ) : (
                    <p className="py-6 text-[12px] text-ink-400">UPI not configured</p>
                  )}

                  <div className="flex items-center gap-3 text-[9px] text-ink-400 justify-center">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent-green" /> 256-bit secured</span>
                    <span>·</span>
                    <span>Powered by UPI</span>
                  </div>
                </div>

                <div className="border-t border-sand-100 p-4">
                  <button onClick={() => setShowPaid(true)}
                    className="w-full rounded-full bg-accent-green py-3 text-[13px] font-bold text-white active:scale-[0.97] shadow-sm">
                    I've Completed Payment
                  </button>
                </div>
              </div>
            ) : (
              /* ── Transaction ID Entry ── */
              <div className="rounded-2xl border border-sand-200 bg-white p-6 space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 text-accent-green mx-auto mb-2" />
                  <p className="text-[15px] font-bold text-ink-900">Confirm Payment</p>
                  <p className="text-[12px] text-ink-500 mt-1">Enter the UTR or Transaction ID from your UPI app</p>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-2">Transaction ID / UTR Number</label>
                  <input type="text" value={txnId} onChange={e => setTxnId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20))} placeholder="e.g. 412345678901" maxLength={20}
                    className="w-full rounded-xl border border-sand-300 bg-sand-50 px-4 py-3.5 text-[15px] font-mono text-center tracking-widest outline-none focus:bg-white focus:border-ink-400 focus:ring-2 focus:ring-ink-200" />
                  {txnId.length > 0 && txnId.length < 4 && <p className="mt-1.5 text-[10px] text-accent-red text-center">Minimum 4 characters</p>}
                  {txnId.length >= 20 && <p className="mt-1.5 text-[10px] text-ink-400 text-center">Maximum 20 characters</p>}
                  {txnId.length >= 4 && txnId.length < 20 && <p className="mt-1.5 text-[10px] text-accent-green text-center font-medium">{txnId.length} characters</p>}
                </div>
                <button onClick={() => setShowPaid(false)} className="block mx-auto text-[11px] text-ink-400 underline">Back to QR Code</button>
              </div>
            )}

            {/* Price summary */}
            <div className="rounded-lg border border-sand-200 bg-white p-4 space-y-1 text-[12px]">
              <div className="flex justify-between text-ink-500"><span>Total MRP</span><span>₹{mrpTotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-accent-green"><span>Discount</span><span>-₹{discount}</span></div>}
              {couponDiscount > 0 && <div className="flex justify-between text-accent-green"><span>Coupon</span><span>-₹{couponDiscount}</span></div>}
              {gcUsed > 0 && <div className="flex justify-between text-accent-teal"><span>Gift Card</span><span>-₹{gcUsed}</span></div>}
              <div className="flex justify-between text-ink-500"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span></div>
              <div className="h-px bg-sand-200" />
              <div className="flex justify-between text-[15px] font-bold text-ink-900"><span>Total</span><span className="font-serif">₹{payable}</span></div>
            </div>

            <button onClick={completeOrder} disabled={busy || (payable > 0 && (!showPaid || txnId.length < 4 || txnId.length > 20))}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent-green py-3.5 text-[14px] font-bold text-white active:scale-[0.97] disabled:opacity-40 shadow-sm">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><Package className="h-4 w-4" /> Place Order</>}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
