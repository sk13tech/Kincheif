import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getCategories, updateCategories } from '../firebase';
import { Save, Loader2, Plus, X } from 'lucide-react';

export default function SiteSettings() {
  const [cfg, setCfg] = useState<Record<string, string>>({});
  const [cats, setCats] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSiteConfig(), getCategories()]).then(([c, cats]) => {
      setCfg(c as any || {}); setCats(cats); setLoading(false);
    });
  }, []);

  const saveCfg = async () => {
    setSaving(true);
    await updateSiteConfig(cfg);
    await updateCategories(cats);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCat = () => { if (newCat.trim() && !cats.includes(newCat.trim())) { setCats([...cats, newCat.trim()]); setNewCat(''); } };
  const removeCat = (i: number) => { const a = [...cats]; a.splice(i, 1); setCats(a); };

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#958d7e] mx-auto" /></div>;

  const fields: { key: string; label: string; placeholder: string }[] = [
    { key: 'siteName', label: 'Site Name', placeholder: 'PureHome' },
    { key: 'logoUrl', label: 'Logo Icon URL', placeholder: 'https://...' },
    { key: 'logoTextUrl', label: 'Logo with Text URL', placeholder: 'https://...' },
    { key: 'heroTitle', label: 'Hero Title', placeholder: 'Pure. Homemade. Delicious.' },
    { key: 'heroSubtitle', label: 'Hero Subtitle', placeholder: 'Authentic recipes...' },
    { key: 'heroBadge', label: 'Hero Badge Text', placeholder: 'Natural Ingredients' },
    { key: 'heroImage', label: 'Hero Image URL', placeholder: 'https://...' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1c1a16] mb-6">Site Settings</h1>
      <div className="max-w-2xl space-y-6">
        {/* Branding & Content */}
        <div className="rounded-xl border border-[#e8e6e1] bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#1c1a16] uppercase tracking-wider">Branding & Content</h3>
          <p className="text-xs text-[#958d7e]">Changes reflect instantly on the live website.</p>
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">{f.label}</label>
              <input value={cfg[f.key] || ''} onChange={e => setCfg({ ...cfg, [f.key]: e.target.value })} placeholder={f.placeholder}
                className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" />
            </div>
          ))}
          {/* Logo previews */}
          <div className="flex gap-4 items-center">
            {cfg.logoUrl && <div className="text-center"><p className="text-[10px] text-[#958d7e] mb-1">Icon</p><img src={cfg.logoUrl} alt="" className="h-12 w-12 rounded-lg object-contain border border-[#e8e6e1]" /></div>}
            {cfg.logoTextUrl && <div className="text-center"><p className="text-[10px] text-[#958d7e] mb-1">Full</p><img src={cfg.logoTextUrl} alt="" className="h-12 object-contain border border-[#e8e6e1] rounded-lg px-2" /></div>}
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-[#e8e6e1] bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#1c1a16] uppercase tracking-wider">Product Categories</h3>
          <div className="flex flex-wrap gap-2">
            {cats.map((c, i) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-[#fafaf8] px-3 py-1 text-xs font-medium text-[#625a4f]">
                {c}
                <button onClick={() => removeCat(i)} className="text-[#c0392b] hover:text-red-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="New category" className="flex-1 rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" />
            <button onClick={addCat} className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm font-medium text-[#625a4f] hover:bg-[#f5f4f2] flex items-center gap-1"><Plus className="h-4 w-4" /> Add</button>
          </div>
        </div>

        <button onClick={saveCfg} disabled={saving}
          className="rounded-lg bg-[#1c1a16] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#332f28] disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Save className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
}
