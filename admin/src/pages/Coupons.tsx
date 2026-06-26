import { useState, useEffect } from 'react';
import { subscribeCoupons, createCoupon, toggleCoupon, deleteCoupon } from '../firebase';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percent', minOrder: '0', maxDiscount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeCoupons(setCoupons), []);

  const save = async () => {
    if (!form.code || !form.discount) return;
    setSaving(true);
    await createCoupon(form.code, {
      discount: Number(form.discount), type: form.type as any,
      minOrder: Number(form.minOrder) || 0, active: true,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
    });
    setSaving(false); setShow(false); setForm({ code: '', discount: '', type: 'percent', minOrder: '0', maxDiscount: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1c1a16]">Coupons ({coupons.length})</h1>
        <button onClick={() => setShow(true)} className="rounded-lg bg-[#1c1a16] px-4 py-2 text-sm font-semibold text-white hover:bg-[#332f28] flex items-center gap-2"><Plus className="h-4 w-4" /> Create Coupon</button>
      </div>

      {show && (
        <div className="rounded-xl border border-[#e8e6e1] bg-white p-5 mb-6 max-w-lg space-y-3">
          <h3 className="text-sm font-semibold text-[#1c1a16]">New Coupon</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm font-mono outline-none focus:border-[#1c1a16]" />
            <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="Discount" className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]">
              <option value="percent">Percent (%)</option><option value="flat">Flat (₹)</option>
            </select>
            <input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} placeholder="Min Order ₹" className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" />
          </div>
          {form.type === 'percent' && <input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Max Discount ₹ (optional)" className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" />}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-lg bg-[#1c1a16] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
            <button onClick={() => setShow(false)} className="rounded-lg border border-[#e8e6e1] px-4 py-2 text-sm font-semibold text-[#625a4f]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {coupons.map(c => (
          <div key={c.id} className="rounded-xl border border-[#e8e6e1] bg-white p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-[#1c1a16]">{c.id}</span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{c.active ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-xs text-[#958d7e]">{c.type === 'percent' ? `${c.discount}%` : `₹${c.discount}`} off · Min ₹{c.minOrder}{c.maxDiscount ? ` · Max ₹${c.maxDiscount}` : ''}</p>
            </div>
            <button onClick={() => toggleCoupon(c.id, !c.active)} className="h-8 w-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-[#f5f4f2]">
              {c.active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-[#958d7e]" />}
            </button>
            <button onClick={() => { if (confirm('Delete?')) deleteCoupon(c.id); }} className="h-8 w-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 text-[#c0392b]" /></button>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-center py-10 text-sm text-[#958d7e]">No coupons created yet</p>}
      </div>
    </div>
  );
}
