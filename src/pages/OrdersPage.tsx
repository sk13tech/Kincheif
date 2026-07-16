import { useState } from 'react';
import { OrderActions, Order } from '../lib/useOrders';

interface Props { orders: OrderActions }

const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery is taking too long',
  'Want to change product/variant',
  'Payment issue',
  'Other',
];

const statusChain = [
  { key: 'pending', label: 'Pending Verification' },
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'replacement_requested', label: 'Replacement Requested', hidden: true },
  { key: 'replacement_shipped', label: 'Replacement Shipped', hidden: true },
  { key: 'replacement_delivered', label: 'Replacement Delivered', hidden: true },
];

function idx(s: string) { const i = statusChain.findIndex(x => x.key === s); return i >= 0 ? i : 0; }

function Detail({ order, onBack, orders }: { order: Order; onBack: () => void; orders: OrderActions }) {
  const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
  const ci = order.status === 'cancelled' ? -1 : idx(order.status);
  const hasR = order.status.startsWith('replacement');
  const cancelled = order.status === 'cancelled';
  const canCancelThis = orders.canCancel(order.status);
  const canReplaceThis = orders.canReplace(order);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [replacing, setReplacing] = useState(false);

  const handleCancel = async () => {
    if (!cancelReason) { setCancelError('Please select a reason'); return; }
    setCancelling(true);
    await orders.cancelOrder(order.id, cancelReason);
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  const handleReplace = async () => {
    setReplacing(true);
    await orders.requestReplacement(order.id);
    setReplacing(false);
    setShowReplaceConfirm(false);
  };

  const cancelledAt = order.cancelledAt?.toDate ? order.cancelledAt.toDate() : null;
  const refundDate = order.refundDate?.toDate ? order.refundDate.toDate() : null;
  const mrpTotal = order.items.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
  const productDiscount = Math.max(mrpTotal - order.subtotal, 0);

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-sec)', fontSize: '.8rem', fontFamily: 'inherit', padding: '0 0 14px', fontWeight: 500 }}>← Back</button>

      {/* Info card */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: '.68rem', color: 'var(--text-sec)' }}>Order ID</div>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>#{order.orderId || order.id}</div>
          </div>
          <span style={{ fontSize: '.66rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: cancelled ? '#fce4ec' : order.status === 'delivered' ? '#e8f5e9' : '#fff3e0', color: cancelled ? '#c62828' : order.status === 'delivered' ? '#2e7d32' : '#e65100' }}>
            {cancelled ? 'Cancelled' : statusChain.find(s => s.key === order.status)?.label || order.status}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '.74rem' }}>
          <div><div style={{ color: 'var(--text-sec)', marginBottom: 1 }}>Date</div><div style={{ color: 'var(--text)', fontWeight: 600 }}>{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
          <div><div style={{ color: 'var(--text-sec)', marginBottom: 1 }}>Time</div><div style={{ color: 'var(--text)', fontWeight: 600 }}>{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div></div>
          <div><div style={{ color: 'var(--text-sec)', marginBottom: 1 }}>Transaction ID</div><div style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'monospace', fontSize: '.7rem' }}>{order.utrNumber || '—'}</div></div>
          <div><div style={{ color: 'var(--text-sec)', marginBottom: 1 }}>Payment</div><div style={{ color: 'var(--text)', fontWeight: 600 }}>₹{(order.amountPaid ?? 0).toLocaleString('en-IN')} UPI{order.giftCardUsed > 0 ? ` + ₹${order.giftCardUsed} Gift` : ''}</div></div>
        </div>

        {/* Cancel button */}
        {canCancelThis && !cancelled && !showCancelConfirm && (
          <button onClick={() => setShowCancelConfirm(true)} style={{ marginTop: 12, padding: '7px 16px', borderRadius: 8, border: '1px solid #e74c3c', background: 'none', color: '#e74c3c', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel Order</button>
        )}

        {/* Cancel confirmation with dropdown */}
        {showCancelConfirm && (
          <div style={{ marginTop: 12, padding: '14px', borderRadius: 10, border: '1px solid #e74c3c', background: '#fff5f5' }}>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#c62828', marginBottom: 6 }}>Confirm cancellation</div>
            <div style={{ fontSize: '.74rem', color: '#c62828', marginBottom: 10, lineHeight: 1.5 }}>
              Are you sure you want to cancel this order? Payment refund takes 5 to 7 working days to process.
            </div>
            <div style={{ fontSize: '.74rem', fontWeight: 600, color: '#c62828', marginBottom: 4 }}>Reason for cancellation *</div>
            <select
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelError(''); }}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 6, border: '1px solid #e57373', background: '#fff', color: '#333', fontSize: '.76rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', appearance: 'auto' }}
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {cancelError && <div style={{ fontSize: '.7rem', color: '#c62828', marginTop: 3 }}>{cancelError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={handleCancel} disabled={cancelling} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e74c3c', color: '#fff', fontSize: '.76rem', fontWeight: 600, cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: cancelling ? .6 : 1 }}>
                {cancelling ? 'Cancelling...' : 'Yes, cancel order'}
              </button>
              <button onClick={() => { setShowCancelConfirm(false); setCancelReason(''); setCancelError(''); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>No, keep it</button>
            </div>
          </div>
        )}

        {/* Replacement button */}
        {canReplaceThis && !showReplaceConfirm && (
          <button onClick={() => setShowReplaceConfirm(true)} style={{ marginTop: 12, padding: '7px 16px', borderRadius: 8, border: '1px solid #e65100', background: 'none', color: '#e65100', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Request Replacement</button>
        )}

        {/* Replacement confirmation */}
        {showReplaceConfirm && (
          <div style={{ marginTop: 12, padding: '14px', borderRadius: 10, border: '1px solid #e65100', background: '#fff8e1' }}>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#e65100', marginBottom: 6 }}>Confirm replacement request</div>
            <div style={{ fontSize: '.74rem', color: '#e65100', marginBottom: 10, lineHeight: 1.5 }}>A replacement will be initiated. The original item must be returned in its original condition.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleReplace} disabled={replacing} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e65100', color: '#fff', fontSize: '.76rem', fontWeight: 600, cursor: replacing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: replacing ? .6 : 1 }}>{replacing ? 'Requesting...' : 'Yes, request replacement'}</button>
              <button onClick={() => setShowReplaceConfirm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation & Refund info — red box */}
      {cancelled && (
        <div style={{ background: '#fff5f5', borderRadius: 14, border: '1px solid #e57373', padding: '18px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#c62828', marginBottom: 10 }}>Cancellation Details</div>
          <div style={{ display: 'grid', gap: 8, fontSize: '.76rem' }}>
            <div>
              <div style={{ color: '#c62828', opacity: .7, marginBottom: 1 }}>Reason</div>
              <div style={{ color: '#c62828', fontWeight: 600 }}>{order.cancelRemark || '—'}</div>
            </div>
            {cancelledAt && (
              <div>
                <div style={{ color: '#c62828', opacity: .7, marginBottom: 1 }}>Cancelled on</div>
                <div style={{ color: '#c62828', fontWeight: 600 }}>
                  {cancelledAt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {cancelledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
            <div>
              <div style={{ color: '#c62828', opacity: .7, marginBottom: 1 }}>Refund Transaction ID</div>
              <div style={{ color: '#c62828', fontWeight: 600, fontFamily: 'monospace' }}>{order.refundTxnId || 'Pending — will be updated by admin'}</div>
            </div>
            {refundDate && (
              <div>
                <div style={{ color: '#c62828', opacity: .7, marginBottom: 1 }}>Refund Date</div>
                <div style={{ color: '#c62828', fontWeight: 600 }}>
                  {refundDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {refundDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
            {!order.refundTxnId && (
              <div style={{ fontSize: '.7rem', color: '#c62828', opacity: .7, marginTop: 4, lineHeight: 1.5 }}>
                Refund takes 5 to 7 working days to process. The refund transaction ID and date will be updated once processed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tracking info — shown when shipped */}
      {(order.status === 'shipped' || order.status === 'delivered') && (order.trackingLink || order.trackingId) && (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Shipment Tracking</div>
          <div style={{ display: 'grid', gap: 8, fontSize: '.76rem' }}>
            {order.trackingId && (
              <div>
                <div style={{ color: 'var(--text-sec)', marginBottom: 1 }}>Tracking ID</div>
                <div style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'monospace' }}>{order.trackingId}</div>
              </div>
            )}
            {order.trackingLink && (
              <a
                href={order.trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: '#0b57cf',
                  color: '#fff',
                  fontSize: '.78rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginTop: 4,
                  width: 'fit-content',
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#fff', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                </svg>
                Track Order
              </a>
            )}
          </div>
        </div>
      )}

      {/* Delivery address */}
      {order.address && (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Delivery Address</div>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{order.address.name}</div>
            <div>{order.address.phone}</div>
            <div>{order.address.line1}{order.address.line2 ? ', ' + order.address.line2 : ''}</div>
            <div>{order.address.city}, {order.address.state} — {order.address.pincode}</div>
          </div>
        </div>
      )}

      {/* Policy */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '14px 18px', marginBottom: 12, fontSize: '.72rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>
        <div style={{ marginBottom: 4 }}>• Cancellation is allowed up to the <strong style={{ color: 'var(--text)' }}>processing</strong> stage only.</div>
        <div>• Replacement can be requested within <strong style={{ color: 'var(--text)' }}>3 days</strong> of delivery.</div>
      </div>

      {/* Status chain */}
      {!cancelled && (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Status</div>
          <div style={{ paddingLeft: 2 }}>
            {statusChain.map((step, i) => {
              if (step.hidden && !hasR) return null;
              const done = i <= ci;
              const nextHidden = statusChain[i + 1]?.hidden && !hasR;
              const isLast = i === statusChain.length - 1 || nextHidden;
              return (
                <div key={step.key} style={{ display: 'flex', gap: 12, minHeight: isLast ? 'auto' : 34 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
                    <div style={{ width: done ? 12 : 10, height: done ? 12 : 10, borderRadius: 6, flexShrink: 0, background: done ? '#27ae60' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {done && <div style={{ width: 4, height: 4, borderRadius: 2, background: '#fff' }} />}
                    </div>
                    {!isLast && <div style={{ width: 2, flex: 1, background: done ? '#27ae60' : 'var(--border)', borderRadius: 1, minHeight: 18 }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 8 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: done ? 600 : 400, color: done ? 'var(--text)' : 'var(--text-sec)' }}>{step.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 18px', marginBottom: 12 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Items</div>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < order.items.length - 1 ? 10 : 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
              {item.image && <img src={item.image} alt={item.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--text-sec)' }}>₹{item.price.toLocaleString('en-IN')} × {item.qty}</div>
            </div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text)', flexShrink: 0, alignSelf: 'center' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {/* Bill */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 18px' }}>
        <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Bill Breakdown</div>
        <R l="MRP Total" r={`₹${mrpTotal.toLocaleString('en-IN')}`} />
        {productDiscount > 0 && <R l="Product Discount" r={`−₹${productDiscount.toLocaleString('en-IN')}`} g />}
        <R l="Subtotal" r={`₹${order.subtotal.toLocaleString('en-IN')}`} />
        {order.couponCode && <R l={`Coupon Code`} r={order.couponCode || '—'} plain />}
        {order.couponDiscount > 0 && <R l="Coupon Discount" r={`−₹${order.couponDiscount.toLocaleString('en-IN')}`} g />}
        <R l="Delivery Charge" r={order.delivery === 0 ? 'FREE' : `₹${order.delivery.toLocaleString('en-IN')}`} g={order.delivery === 0} />
        {order.giftCardCode && <R l="Gift Card" r={order.giftCardCode || '—'} plain />}
        {order.giftCardUsed > 0 && <R l="Gift Card Used" r={`−₹${order.giftCardUsed.toLocaleString('en-IN')}`} g />}
        <R l="Amount Paid (UPI)" r={order.amountPaid > 0 ? `₹${order.amountPaid.toLocaleString('en-IN')}` : '₹0'} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '.84rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Final Total</span>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹${order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

function R({ l, r, g, plain }: { l: string; r: string; g?: boolean; plain?: boolean }) {
  return (
    <div style={{ fontSize: '.76rem', color: g ? '#27ae60' : 'var(--text-sec)', marginBottom: 4, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span>{l}</span>
      <span style={{ fontWeight: plain ? 500 : 600, color: g ? '#27ae60' : 'var(--text)', textAlign: 'right' }}>{r}</span>
    </div>
  );
}

export default function OrdersPage({ orders }: Props) {
  const [viewId, setViewId] = useState<string | null>(null);

  if (orders.loading) return <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px' }}><span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>Loading...</span></div>;

  const viewOrder = viewId ? orders.orders.find(o => o.id === viewId) : null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px' }}>
      {viewOrder ? (
        <Detail order={viewOrder} onBack={() => setViewId(null)} orders={orders} />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Orders</h3>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {orders.orders.length === 0 ? (
            <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '40px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '.88rem', color: 'var(--text-sec)' }}>No orders yet</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {orders.orders.map(order => {
                const dt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
                const n = order.items.reduce((s, i) => s + i.qty, 0);
                const cancelled = order.status === 'cancelled';
                const delivered = order.status === 'delivered';
                const canRep = orders.canReplace(order);
                return (
                  <div key={order.id} style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, height: 76 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#eee', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                      {order.items[0]?.image && <img src={order.items[0].image} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      {order.items.length > 1 && <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'var(--bg)', borderRadius: 4, padding: '1px 4px', fontSize: '.56rem', fontWeight: 700, color: 'var(--text-sec)' }}>+{order.items.length - 1}</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 600, color: cancelled ? 'var(--text-sec)' : 'var(--text)', textDecoration: cancelled ? 'line-through' : 'none' }}>₹{order.total.toLocaleString('en-IN')} · {n} item{n > 1 ? 's' : ''}</div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-sec)', marginTop: 2 }}>
                        {dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · <span style={{ color: cancelled ? '#c62828' : order.status === 'pending' ? '#e65100' : '#27ae60', fontWeight: 500 }}>{cancelled ? 'Cancelled' : statusChain.find(s => s.key === order.status)?.label || order.status}</span>
                      </div>
                      {delivered && canRep && <div style={{ fontSize: '.62rem', color: '#e65100', marginTop: 2 }}>Replacement available</div>}
                      {delivered && !canRep && <div style={{ fontSize: '.62rem', color: 'var(--text-sec)', marginTop: 2 }}>Replacement period expired</div>}
                    </div>
                    <button onClick={() => setViewId(order.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>View</button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
