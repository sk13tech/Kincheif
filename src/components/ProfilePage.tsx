import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, MapPin, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { getUserProfile, saveUserProfile, getSavedAddresses, saveAddress, deleteAddress, type SavedAddress } from '../lib/firebase';

interface Props { onBack: () => void; }

export default function ProfilePage({ onBack }: Props) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', name: '', phone: '', email: user?.email || '', address: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => { if (p) { setPhone(p.phone || ''); setName(p.displayName || user.displayName || ''); } });
    getSavedAddresses(user.uid).then(setAddresses);
  }, [user]);

  const doSave = async () => {
    if (!user) return;
    setSaving(true);
    await saveUserProfile(user.uid, { phone, displayName: name });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const doSaveAddr = async () => {
    if (!user || !newAddr.address) return;
    const id = await saveAddress(user.uid, { ...newAddr, notes: '' }, newAddr.label);
    if (id) { setAddresses((p) => [...p, { ...newAddr, notes: '', id, label: newAddr.label }]); setShowNewAddr(false); setNewAddr({ label: 'Home', name: '', phone: '', email: user.email || '', address: '', city: '', state: '', pincode: '' }); }
  };

  const doDeleteAddr = async (id: string) => { await deleteAddress(id); setAddresses((p) => p.filter((a) => a.id !== id)); };

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-sand-50 pt-14">
      <div className="sticky top-14 z-10 bg-sand-50/92 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-300 bg-white text-ink-500 hover:border-ink-400 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-[15px] font-semibold text-ink-800">Profile</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
        {/* Profile card */}
        <div className="rounded-lg border border-sand-200 bg-white p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-full border border-sand-200 overflow-hidden bg-sand-100 flex items-center justify-center">
              {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <span className="text-lg font-bold text-ink-500">{(user.displayName || 'U').charAt(0)}</span>}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink-800">{user.displayName}</p>
              <p className="text-[12px] text-ink-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-ink-400 focus:ring-1 focus:ring-ink-200" />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Email <span className="text-ink-300">(not editable)</span></label>
              <input value={user.email || ''} disabled className="w-full rounded-lg border border-sand-200 bg-sand-100 px-3.5 py-2.5 text-[14px] text-ink-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="9876543210"
                className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-ink-400 focus:ring-1 focus:ring-ink-200" />
            </div>
          </div>

          <button onClick={doSave} disabled={saving} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 py-2.5 text-[13px] font-semibold text-sand-50 active:scale-[0.97] disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? '✓ Saved!' : <><Save className="h-4 w-4" /> Save Profile</>}
          </button>
        </div>

        {/* Saved Addresses */}
        <div className="rounded-lg border border-sand-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono uppercase tracking-[.12em] text-ink-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Saved Addresses</p>
            <button onClick={() => setShowNewAddr(true)} className="text-[10px] text-accent-blue font-medium flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
          </div>

          {showNewAddr && (
            <div className="rounded-lg border border-sand-200 bg-sand-50 p-3 mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={newAddr.label} onChange={(e) => setNewAddr(p => ({ ...p, label: e.target.value }))} placeholder="Label (Home)" className="rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
                <input value={newAddr.name} onChange={(e) => setNewAddr(p => ({ ...p, name: e.target.value }))} placeholder="Name" className="rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
              </div>
              <input value={newAddr.phone} onChange={(e) => setNewAddr(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
              <input value={newAddr.address} onChange={(e) => setNewAddr(p => ({ ...p, address: e.target.value }))} placeholder="Address" className="w-full rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
              <div className="grid grid-cols-3 gap-2">
                <input value={newAddr.city} onChange={(e) => setNewAddr(p => ({ ...p, city: e.target.value }))} placeholder="City" className="rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
                <input value={newAddr.state} onChange={(e) => setNewAddr(p => ({ ...p, state: e.target.value }))} placeholder="State" className="rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
                <input value={newAddr.pincode} onChange={(e) => setNewAddr(p => ({ ...p, pincode: e.target.value }))} placeholder="Pincode" className="rounded-md border border-sand-300 px-2.5 py-2 text-[12px] outline-none focus:border-ink-400" />
              </div>
              <div className="flex gap-2">
                <button onClick={doSaveAddr} className="flex-1 rounded-full bg-ink-900 py-2 text-[11px] font-semibold text-sand-50 active:scale-95">Save Address</button>
                <button onClick={() => setShowNewAddr(false)} className="flex-1 rounded-full border border-sand-300 py-2 text-[11px] font-semibold text-ink-600 active:scale-95">Cancel</button>
              </div>
            </div>
          )}

          {addresses.length === 0 && !showNewAddr ? (
            <p className="text-[12px] text-ink-400 text-center py-4">No saved addresses yet</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border border-sand-200 p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-ink-800">{a.label}</p>
                    <p className="text-[10px] text-ink-500 truncate">{a.name} · {a.address}, {a.city}</p>
                  </div>
                  <button onClick={() => doDeleteAddr(a.id)} className="h-6 w-6 inline-flex items-center justify-center rounded-full text-ink-300 hover:text-accent-red active:scale-95"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
