import { useState, useEffect } from 'react';
import { subscribeOrders, updateOrderStatus } from '../firebase';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-teal-50 text-teal-700 border-teal-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sel, setSel] = useState<any | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => subscribeOrders(setOrders), []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const changeStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
  };

  if (sel) return (
    <div>
      <button onClick={() => setSel(null)} className="flex items-center gap-2 text-sm text-[#958d7e] hover:text-[#1c1a16] mb-4"><ArrowLeft className="h-4 w-4" /> Back to Orders</button>
      <div className="max-w-2xl space-y-4">
        <div className="rounded-xl border border-[#e8e6e1] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono text-[#958d7e]">#{sel.orderId || sel.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-[#958d7e]">{fmtDate(sel.createdAt)}</p>
            </div>
            <select value={sel.status} onChange={e => changeStatus(sel.id, e.target.value)}
              className="rounded-lg border border-[#e8e6e1] px-3 py-1.5 text-sm font-medium outline-none focus:border-[#1c1a16]">
              {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="rounded-lg bg-[#fafaf8] p-3 mb-4">
            <p className="text-sm font-semibold text-[#1c1a16]">{sel.customer?.name}</p>
            <p className="text-xs text-[#958d7e]">{sel.customer?.address}, {sel.customer?.city}, {sel.customer?.state} - {sel.customer?.pincode}</p>
            <p className="text-xs text-[#958d7e] font-mono mt-0.5">{sel.customer?.phone} · {sel.customer?.email}</p>
          </div>
          <div className="space-y-2 mb-4">
            {sel.items?.map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-10 w-10 rounded-lg border border-[#e8e6e1] object-cover" />
                <div className="flex-1"><p className="text-sm font-medium text-[#1c1a16]">{it.name}</p><p className="text-xs text-[#958d7e]">{it.qty} x ₹{it.price}</p></div>
                <span className="text-sm font-bold">₹{it.price * it.qty}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm border-t border-[#e8e6e1] pt-3">
            {sel.mrpTotal && <div className="flex justify-between text-[#958d7e]"><span>MRP</span><span>₹{sel.mrpTotal}</span></div>}
            {sel.productDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{sel.productDiscount}</span></div>}
            {sel.couponCode && <div className="flex justify-between text-green-600"><span>Coupon ({sel.couponCode})</span><span>-₹{sel.couponDiscount}</span></div>}
            {sel.giftCardCode && <div className="flex justify-between text-teal-600"><span>Gift Card ({sel.giftCardCode})</span><span>-₹{sel.giftCardUsed}</span></div>}
            {sel.transactionId && <div className="flex justify-between text-[#958d7e]"><span>Txn ID</span><span className="font-mono">{sel.transactionId}</span></div>}
            <div className="flex justify-between text-lg font-bold text-[#1c1a16] pt-2 border-t border-[#e8e6e1]"><span>Paid</span><span>₹{sel.totalAmount}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1c1a16]">Orders ({filtered.length})</h1>
        <div className="relative">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[#e8e6e1] bg-white px-4 py-2 pr-8 text-sm font-medium outline-none focus:border-[#1c1a16]">
            <option value="all">All Orders</option>
            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#958d7e] pointer-events-none" />
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map(o => (
          <button key={o.id} onClick={() => setSel(o)} className="w-full text-left rounded-xl border border-[#e8e6e1] bg-white p-4 hover:border-[#958d7e] transition-all">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-[#958d7e]">#{o.orderId || o.id.slice(-8).toUpperCase()}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase border ${statusColors[o.status] || 'bg-gray-50 text-gray-700'}`}>{o.status}</span>
                </div>
                <p className="text-sm font-semibold text-[#1c1a16] mt-1">{o.customer?.name} · {o.items?.length} items · ₹{o.totalAmount}</p>
                <p className="text-xs text-[#958d7e]">{fmtDate(o.createdAt)}</p>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-center py-10 text-sm text-[#958d7e]">No orders found</p>}
      </div>
    </div>
  );
}
