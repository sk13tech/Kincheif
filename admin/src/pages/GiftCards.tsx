import { useState, useEffect } from 'react';
import { subscribeGiftCards, createGiftCard, deleteGiftCard } from '../firebase';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function GiftCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeGiftCards(setCards), []);

  const save = async () => {
    if (!code || !balance) return;
    setSaving(true);
    await createGiftCard(code, Number(balance));
    setSaving(false); setShow(false); setCode(''); setBalance('');
  };

  const genCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c = 'GC-';
    for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
    setCode(c);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1c1a16]">Gift Cards ({cards.length})</h1>
        <button onClick={() => { setShow(true); genCode(); }} className="rounded-lg bg-[#1c1a16] px-4 py-2 text-sm font-semibold text-white hover:bg-[#332f28] flex items-center gap-2"><Plus className="h-4 w-4" /> Generate</button>
      </div>

      {show && (
        <div className="rounded-xl border border-[#e8e6e1] bg-white p-5 mb-6 max-w-sm space-y-3">
          <h3 className="text-sm font-semibold text-[#1c1a16]">New Gift Card</h3>
          <div>
            <label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Code</label>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="flex-1 rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm font-mono outline-none focus:border-[#1c1a16]" />
              <button onClick={genCode} className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-xs font-medium text-[#625a4f] hover:bg-[#f5f4f2]">Random</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Balance (₹)</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="500" className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-lg bg-[#1c1a16] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
            <button onClick={() => setShow(false)} className="rounded-lg border border-[#e8e6e1] px-4 py-2 text-sm font-semibold text-[#625a4f]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {cards.map(c => (
          <div key={c.id} className="rounded-xl border border-[#e8e6e1] bg-white p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-[#1c1a16]">{c.id}</span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{c.active ? 'Active' : 'Used'}</span>
              </div>
              <p className="text-xs text-[#958d7e]">Balance: ₹{c.balance}</p>
            </div>
            <button onClick={() => { if (confirm('Delete?')) deleteGiftCard(c.id); }} className="h-8 w-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 text-[#c0392b]" /></button>
          </div>
        ))}
        {cards.length === 0 && <p className="text-center py-10 text-sm text-[#958d7e]">No gift cards yet</p>}
      </div>
    </div>
  );
}
