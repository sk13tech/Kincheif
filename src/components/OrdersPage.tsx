import { useState, useEffect, useRef } from 'react';
import { Package, Clock, CheckCircle, Truck, Home, ArrowLeft, ChevronRight, RefreshCw, Tag, Gift, XCircle, RotateCcw, Loader2, AlertTriangle, MessageSquare, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { subscribeToOrders, cancelOrder, requestReplacement, subscribeSiteConfig, type FirestoreOrder, type SiteConfig, db } from '../lib/firebase';
import { sanitize } from '../lib/security';

interface Props { onBack: () => void; }

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];
function getSI(s: string) { return Math.max(0, statusSteps.findIndex(x => x.key === s)); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function fmtShort(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

function getReplaceDaysLeft(order: FirestoreOrder): number {
  if (order.status !== 'delivered') return -1;
  const base = (order as any).deliveredAt ? new Date((order as any).deliveredAt) : new Date(order.createdAt);
  return Math.max(0, Math.ceil(3 - (Date.now() - base.getTime()) / (1000 * 60 * 60 * 24)));
}

const replaceReasons = ['Damaged product', 'Wrong item received', 'Missing items', 'Quality issue', 'Packaging damaged', 'Other'];

function CompletePaymentCard({ order, onComplete }: { order: FirestoreOrder; onComplete: () => void }) {
  const [cfg, setCfg] = useState<SiteConfig>({});
  const [txnId, setTxnId] = useState('');
  const [busy, setBusy] = useState(false);
  const [showTxn, setShowTxn] = useState(false);
  const [timer, setTimer] = useState(300);

  useEffect(() => subscribeSiteConfig(setCfg), []);
  useEffect(() => { const t = setInterval(() => setTimer(v => v <= 1 ? (clearInterval(t), 0) : v - 1), 1000); return () => clearInterval(t); }, []);

  // Build UPI string with correct amount
  const buildUpi = (tpl: string, amt: number) => { if (!tpl) return ''; return tpl.includes('am=') ? tpl.replace(/am=[^&]*/i, `am=${amt}`) : tpl + (tpl.includes('?') ? '&' : '?') + `am=${amt}`; };
  const qrData = buildUpi(cfg.upiTemplate || '', order.totalAmount);
  const qrImgUrl = qrData ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}` : '';
  const fmtT = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const submit = async () => {
    if (txnId.length < 4) return;
    setBusy(true);
    try {
      const { collection: c, query: q, where: w, getDocs: g, updateDoc: u } = await import('firebase/firestore');
      const snap = await g(q(c(db, 'orders'), w('orderId', '==', order.orderId)));
      if (!snap.empty) await u(snap.docs[0].ref, { transactionId: sanitize(txnId) });
      onComplete();
    } catch { alert('Update failed. Try again.'); }
    setBusy(false);
  };

  return (
    <div className="rounded-lg border-2 border-accent-yellow/30 bg-accent-yellow/5 p-4 space-y-4">
      <div className="text-center">
        <QrCode className="h-6 w-6 text-accent-yellow mx-auto mb-1" />
        <p className="text-[13px] font-semibold text-ink-800">Payment Pending</p>
        <p className="text-[11px] text-ink-500">Scan to pay ₹{order.totalAmount}</p>
      </div>

      {!showTxn ? (
        <>
          {timer > 0 && qrData ? (
            <div className="text-center">
              <div className="inline-block rounded-2xl border-2 border-sand-200 p-2 bg-white">
                <img src={qrImgUrl} alt="QR" className="h-[160px] w-[160px]" />
              </div>
              <p className={`text-[12px] font-mono font-semibold mt-2 ${timer < 60 ? 'text-accent-red' : 'text-ink-500'}`}>{fmtT(timer)}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[12px] text-accent-red font-semibold">QR Expired</p>
              <button onClick={() => setTimer(300)} className="text-[11px] text-accent-blue underline mt-1">Refresh</button>
            </div>
          )}
          <button onClick={() => setShowTxn(true)} className="w-full rounded-full bg-ink-900 py-2.5 text-[12px] font-semibold text-sand-50 active:scale-[0.97]">I've Paid</button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Transaction ID</label>
            <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="Enter UTR / Txn ID" maxLength={50}
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-[13px] font-mono outline-none focus:border-ink-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTxn(false)} className="flex-1 rounded-full border border-sand-300 py-2.5 text-[11px] font-semibold text-ink-600 active:scale-[0.97]">Back to QR</button>
            <button onClick={submit} disabled={busy || txnId.length < 4} className="flex-1 rounded-full bg-accent-green py-2.5 text-[11px] font-semibold text-white active:scale-[0.97] disabled:opacity-40">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Complete Payment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersPage({ onBack }: Props) {
  const { user, login } = useAuth();
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<FirestoreOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceReason, setReplaceReason] = useState('');
  const selRef = useRef(sel); selRef.current = sel;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    return subscribeToOrders(user.uid, o => { setOrders(o); setLoading(false); if (selRef.current) { const u = o.find(x => x.id === selRef.current!.id); if (u) setSel(u); } });
  }, [user]);

  const doCancel = async () => {
    if (!sel || !user) return; setCancelling(true);
    await cancelOrder(sel.id, user.uid);
    setShowCancelConfirm(false); setCancelling(false);
  };

  const doReplace = async () => {
    if (!sel || !user || !replaceReason) return; setReplacing(true);
    const ok = await requestReplacement(sel.id, user.uid, replaceReason);
    if (!ok) alert('Replacement not available.');
    setShowReplaceModal(false); setReplaceReason(''); setReplacing(false);
  };

  if (!user) return (
    <div className="min-h-screen bg-sand-50 pt-14"><div className="mx-auto max-w-lg px-4 py-20 text-center">
      <Package className="h-10 w-10 text-ink-300 mx-auto mb-4" />
      <h2 className="font-serif text-xl text-ink-900">Sign in to view orders</h2>
      <button onClick={login} className="mt-5 rounded-full bg-ink-900 px-6 py-3 text-[13px] font-semibold text-sand-50 active:scale-[0.97]">Sign in</button>
    </div></div>
  );

  const isCancellable = sel && ['pending', 'confirmed', 'processing'].includes(sel.status);
  const replaceDaysLeft = sel ? getReplaceDaysLeft(sel) : -1;
  const isReplaceable = sel && sel.status === 'delivered' && replaceDaysLeft > 0 && !(sel as any).replacementRequested;
  const alreadyReplaced = sel && (sel as any).replacementRequested;

  // Build timeline dates from order data
  const getTimelineDate = (step: string): string | null => {
    if (!sel) return null;
    if (step === 'pending') return sel.createdAt;
    if (step === 'delivered' && (sel as any).deliveredAt) return (sel as any).deliveredAt;
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-sand-50 pt-14">
      <div className="sticky top-14 z-10 bg-sand-50/92 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button onClick={sel ? () => setSel(null) : onBack} className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-300 bg-white text-ink-500 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-[15px] font-semibold text-ink-800">{sel ? `#${sel.orderId || sel.id.slice(-8).toUpperCase()}` : 'My Orders'}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Order header */}
              <div className="rounded-lg border border-sand-200 bg-white p-4 text-center">
                <p className="text-[10px] font-mono uppercase tracking-[.15em] text-ink-400">Order ID</p>
                <p className="text-[16px] font-mono font-bold text-ink-800 mt-1">{sel.orderId || sel.id.slice(-8).toUpperCase()}</p>
                <p className="text-[11px] text-ink-400 mt-0.5">{fmtDate(sel.createdAt)}</p>
                {(sel as any).status === 'cancelled' && <span className="inline-block mt-2 rounded-full bg-accent-red/10 text-accent-red border border-accent-red/20 px-3 py-0.5 text-[10px] font-mono uppercase">Cancelled</span>}
              </div>

              {/* Complete Payment — shown at top for AWAITING_PAYMENT */}
              {sel.transactionId === 'AWAITING_PAYMENT' && sel.status === 'pending' && (
                <CompletePaymentCard order={sel} onComplete={() => setSel(null)} />
              )}

              {/* Timeline with dates */}
              {(sel as any).status !== 'cancelled' && (
                <div className="rounded-lg border border-sand-200 bg-white p-5">
                  <p className="text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-4">Tracking</p>
                  {statusSteps.map((step, i) => {
                    const ci = getSI(sel.status); const done = i <= ci; const cur = i === ci;
                    const stepDate = getTimelineDate(step.key);
                    return (
                      <div key={step.key} className="flex gap-4 mb-5 last:mb-0">
                        <div className="relative flex flex-col items-center">
                          <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${done ? 'border-accent-green bg-accent-green/10' : 'border-sand-300 bg-sand-50'} ${cur ? 'ring-4 ring-accent-green/20' : ''}`}>
                            <step.icon className={`h-4 w-4 ${done ? 'text-accent-green' : 'text-ink-300'}`} />
                          </div>
                          {i < statusSteps.length - 1 && <div className={`absolute top-9 w-0.5 h-8 ${i < ci ? 'bg-accent-green' : 'bg-sand-200'}`} />}
                        </div>
                        <div className="pt-1.5 flex-1">
                          <p className={`text-[13px] font-semibold ${done ? 'text-ink-800' : 'text-ink-400'}`}>{step.label}</p>
                          {stepDate && <p className="text-[10px] text-ink-400">{fmtShort(stepDate)}</p>}
                          {cur && !stepDate && <p className="text-[10px] text-accent-green font-medium">Current</p>}
                        </div>
                      </div>
                    );
                  })}

                  {/* Replacement timeline — shown inline after delivered */}
                  {alreadyReplaced && (
                    <div className="flex gap-4 mt-1">
                      <div className="relative flex flex-col items-center">
                        <div className="absolute -top-4 w-0.5 h-4 bg-accent-blue" />
                        <div className="h-9 w-9 rounded-full border-2 border-accent-blue bg-accent-blue/10 flex items-center justify-center ring-4 ring-accent-blue/10">
                          <RotateCcw className="h-4 w-4 text-accent-blue" />
                        </div>
                      </div>
                      <div className="pt-1.5 flex-1">
                        <p className="text-[13px] font-semibold text-accent-blue">Replacement Requested</p>
                        {(sel as any).replacementRequestedAt && <p className="text-[10px] text-ink-400">{fmtShort((sel as any).replacementRequestedAt)}</p>}
                        {(sel as any).replacementReason && <p className="text-[10px] text-ink-500 mt-0.5 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {(sel as any).replacementReason}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="rounded-lg border border-sand-200 bg-white p-4">
                <p className="text-[10px] font-mono uppercase tracking-[.12em] text-ink-400 mb-3">Items</p>
                {sel.items.map((it: any) => (
                  <div key={it.id || it.name} className="flex items-center gap-3 mb-2 last:mb-0">
                    <img src={it.image} alt="" className="h-12 w-12 rounded-lg border border-sand-100 object-cover" />
                    <div className="flex-1 min-w-0"><p className="text-[12px] font-medium text-ink-800 truncate">{it.name}</p><p className="text-[10px] text-ink-400">{it.qty} × ₹{it.price}</p></div>
                    <span className="text-[12px] font-bold font-serif text-ink-800">₹{it.price * it.qty}</span>
                  </div>
                ))}
              </div>

              {/* Tracking — shown when shipped */}
              {(sel as any).trackingId && (
                <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/5 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-[.12em] text-accent-blue mb-1.5">Shipment Tracking</p>
                  <p className="text-[12px] font-mono text-ink-700 mb-2">{(sel as any).trackingId}</p>
                  {(sel as any).trackingLink ? (
                    <a href={(sel as any).trackingLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent-blue text-white px-4 py-1.5 text-[11px] font-semibold active:scale-[0.97]">
                      <Truck className="h-3.5 w-3.5" /> Track Shipment
                    </a>
                  ) : null}
                </div>
              )}

              {/* Financial */}
              <div className="rounded-lg border border-sand-200 bg-white p-4 space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-[.12em] text-ink-400 mb-2">Price Breakdown</p>
                {sel.mrpTotal && <div className="flex justify-between text-[12px] text-ink-500"><span>MRP Total</span><span>₹{sel.mrpTotal}</span></div>}
                {sel.productDiscount && sel.productDiscount > 0 && <div className="flex justify-between text-[12px] text-accent-green font-medium"><span>Discount</span><span>−₹{sel.productDiscount}</span></div>}
                {sel.couponCode && sel.couponDiscount && <div className="flex justify-between text-[12px] text-accent-green font-medium"><span className="flex items-center gap-1"><Tag className="h-3 w-3" />{sel.couponCode}</span><span>−₹{sel.couponDiscount}</span></div>}
                {sel.giftCardCode && sel.giftCardUsed && <div className="flex justify-between text-[12px] text-accent-teal font-medium"><span className="flex items-center gap-1"><Gift className="h-3 w-3" />{sel.giftCardCode}</span><span>−₹{sel.giftCardUsed}</span></div>}
                {/* Always show UPI txn ID if exists — even when gift card was partially used */}
                {sel.transactionId && sel.transactionId !== 'GIFTCARD' && <div className="flex justify-between text-[11px] text-ink-400"><span>UPI Txn ID</span><span className="font-mono">{sel.transactionId}</span></div>}
                <div className="h-px bg-sand-200 my-1" />
                <div className="flex justify-between text-[15px] font-bold text-ink-900"><span>Paid via UPI</span><span className="font-serif">₹{sel.totalAmount}</span></div>
                {(sel as any).refundTxnId && (
                  <div className="mt-2 rounded-lg bg-accent-green/5 border border-accent-green/20 p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent-green flex-shrink-0" />
                      <div>
                        <p className="text-[12px] font-semibold text-accent-green">Refund Processed</p>
                        <p className="text-[10px] text-ink-500">Amount: ₹{(sel as any).refundAmount || sel.totalAmount}</p>
                        <p className="text-[10px] text-ink-400 font-mono">Txn: {(sel as any).refundTxnId}</p>
                        {(sel as any).refundedAt && <p className="text-[9px] text-ink-400">{fmtDate((sel as any).refundedAt)}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {isCancellable && (
                  <button onClick={() => setShowCancelConfirm(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-accent-red/30 py-2.5 text-[12px] font-semibold text-accent-red hover:bg-accent-red/5 active:scale-[0.97]">
                    <XCircle className="h-3.5 w-3.5" /> Cancel Order
                  </button>
                )}
                {isReplaceable && (
                  <div>
                    <button onClick={() => setShowReplaceModal(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-accent-blue/30 py-2.5 text-[12px] font-semibold text-accent-blue hover:bg-accent-blue/5 active:scale-[0.97]">
                      <RotateCcw className="h-3.5 w-3.5" /> Request Replacement
                    </button>
                    <p className="text-[9px] text-accent-blue text-center mt-1">{replaceDaysLeft} day{replaceDaysLeft !== 1 ? 's' : ''} left</p>
                  </div>
                )}
                {sel.status === 'delivered' && replaceDaysLeft <= 0 && !alreadyReplaced && (
                  <p className="text-[10px] text-ink-400 text-center">Replacement window expired</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="py-20 text-center"><RefreshCw className="h-6 w-6 text-ink-300 animate-spin mx-auto mb-3" /><p className="text-[13px] text-ink-400">Loading…</p></div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center"><Package className="h-10 w-10 text-ink-300 mx-auto mb-3" /><h3 className="font-serif text-lg text-ink-700">No orders yet</h3></div>
              ) : (
                <div className="space-y-3">
                  {orders.map(o => {
                    const isCncl = (o as any).status === 'cancelled';
                    const si = isCncl ? null : statusSteps[getSI(o.status)];
                    const Icon = si?.icon || (isCncl ? XCircle : Clock);
                    return (
                      <button key={o.id} onClick={() => setSel(o)} className="w-full text-left rounded-lg border border-sand-200 bg-white p-4 hover:border-sand-400 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-sand-100 border border-sand-200 flex items-center justify-center">
                            <Icon className={`h-5 w-5 ${isCncl ? 'text-accent-red' : 'text-accent-green'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[12px] font-mono text-ink-500">#{o.orderId || o.id.slice(-8).toUpperCase()}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono uppercase ${isCncl ? 'bg-accent-red/10 text-accent-red border border-accent-red/20' : o.status === 'delivered' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'}`}>{o.status}</span>
                            </div>
                            <p className="text-[14px] font-semibold text-ink-800 mt-1">{o.items.length} item{o.items.length > 1 ? 's' : ''} · ₹{o.totalAmount}</p>
                            <p className="text-[11px] text-ink-400 mt-0.5">{fmtDate(o.createdAt)}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-ink-300 flex-shrink-0 self-center" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel Confirmation */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] mx-auto max-w-sm rounded-2xl bg-white border border-sand-200 shadow-2xl p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-accent-red mx-auto mb-3" />
              <h3 className="font-serif text-lg text-ink-900 mb-1">Cancel this order?</h3>
              <p className="text-[12px] text-ink-500 mb-5">This action cannot be undone. Refund within 5-7 business days.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 rounded-full border border-sand-300 py-2.5 text-[12px] font-semibold text-ink-600 active:scale-[0.97]">Keep Order</button>
                <button onClick={doCancel} disabled={cancelling} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-red py-2.5 text-[12px] font-semibold text-white active:scale-[0.97] disabled:opacity-50">
                  {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Replacement Reason Modal */}
      <AnimatePresence>
        {showReplaceModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowReplaceModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] mx-auto max-w-sm rounded-2xl bg-white border border-sand-200 shadow-2xl p-6">
              <h3 className="font-serif text-lg text-ink-900 mb-1">Request Replacement</h3>
              <p className="text-[12px] text-ink-500 mb-4">Select a reason for your replacement request.</p>
              <div className="space-y-2 mb-4">
                {replaceReasons.map(r => (
                  <button key={r} onClick={() => setReplaceReason(r)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-[12px] font-medium transition-all ${replaceReason === r ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-sand-200 text-ink-600 hover:bg-sand-50'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowReplaceModal(false); setReplaceReason(''); }} className="flex-1 rounded-full border border-sand-300 py-2.5 text-[12px] font-semibold text-ink-600 active:scale-[0.97]">Cancel</button>
                <button onClick={doReplace} disabled={replacing || !replaceReason} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-blue py-2.5 text-[12px] font-semibold text-white active:scale-[0.97] disabled:opacity-40">
                  {replacing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><RotateCcw className="h-3.5 w-3.5" /> Submit</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
