import { useState, useEffect } from 'react';
import { subscribeProducts, createProduct, updateProduct, deleteProduct } from '../firebase';
import { Plus, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react';

const empty = { name: '', description: '', longDescription: '', price: 0, originalPrice: 0, image: '', images: [''], category: 'Spices', tags: [''], weight: '', ingredients: [''], shelfLife: '', inStock: true, isNew: false, isBestseller: false, rating: 4.5, reviews: 0 };

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>({ ...empty });
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeProducts(setProducts), []);

  const startCreate = () => { setForm({ ...empty }); setCreating(true); setEditing(null); };
  const startEdit = (p: any) => { setForm({ ...p, tags: p.tags || [''], images: p.images || [''], ingredients: p.ingredients || [''] }); setEditing(p); setCreating(false); };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    setSaving(true);
    const data = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || null, rating: Number(form.rating), reviews: Number(form.reviews),
      tags: form.tags.filter((t: string) => t.trim()), images: form.images.filter((i: string) => i.trim()), ingredients: form.ingredients.filter((i: string) => i.trim()) };
    if (editing) await updateProduct(editing.id, data);
    else await createProduct(data);
    setSaving(false); cancel();
  };

  const doDelete = async (id: string) => { if (confirm('Delete this product?')) await deleteProduct(id); };

  const updateArr = (field: string, idx: number, val: string) => {
    const arr = [...form[field]]; arr[idx] = val; setForm({ ...form, [field]: arr });
  };
  const addArr = (field: string) => setForm({ ...form, [field]: [...form[field], ''] });
  const removeArr = (field: string, idx: number) => { const arr = [...form[field]]; arr.splice(idx, 1); setForm({ ...form, [field]: arr }); };

  if (creating || editing) return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1c1a16]">{editing ? 'Edit Product' : 'New Product'}</h1>
        <button onClick={cancel} className="h-9 w-9 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-[#f5f4f2]"><X className="h-4 w-4" /></button>
      </div>
      <div className="max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
          <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
        </div>
        <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Short Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
        <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Long Description</label><textarea value={form.longDescription} onChange={e => setForm({ ...form, longDescription: e.target.value })} rows={3} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16] resize-none" /></div>
        <div className="grid grid-cols-4 gap-4">
          <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Price</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
          <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">MRP</label><input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
          <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Weight</label><input value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
          <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Shelf Life</label><input value={form.shelfLife} onChange={e => setForm({ ...form, shelfLife: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
        </div>
        <div><label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Main Image URL</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" /></div>
        <div>
          <label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Gallery Images</label>
          {form.images.map((img: string, i: number) => (
            <div key={i} className="flex gap-2 mb-1.5"><input value={img} onChange={e => updateArr('images', i, e.target.value)} className="flex-1 rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" placeholder="Image URL" /><button onClick={() => removeArr('images', i)} className="text-[#c0392b] px-2"><X className="h-4 w-4" /></button></div>
          ))}
          <button onClick={() => addArr('images')} className="text-xs text-[#2f6fa7] font-medium mt-1">+ Add Image</button>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Tags</label>
          {form.tags.map((tag: string, i: number) => (
            <div key={i} className="flex gap-2 mb-1.5"><input value={tag} onChange={e => updateArr('tags', i, e.target.value)} className="flex-1 rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" placeholder="Tag" /><button onClick={() => removeArr('tags', i)} className="text-[#c0392b] px-2"><X className="h-4 w-4" /></button></div>
          ))}
          <button onClick={() => addArr('tags')} className="text-xs text-[#2f6fa7] font-medium mt-1">+ Add Tag</button>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#958d7e] uppercase mb-1">Ingredients</label>
          {form.ingredients.map((ing: string, i: number) => (
            <div key={i} className="flex gap-2 mb-1.5"><input value={ing} onChange={e => updateArr('ingredients', i, e.target.value)} className="flex-1 rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm outline-none focus:border-[#1c1a16]" placeholder="Ingredient" /><button onClick={() => removeArr('ingredients', i)} className="text-[#c0392b] px-2"><X className="h-4 w-4" /></button></div>
          ))}
          <button onClick={() => addArr('ingredients')} className="text-xs text-[#2f6fa7] font-medium mt-1">+ Add Ingredient</button>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} className="accent-[#1c1a16]" /> In Stock</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isNew} onChange={e => setForm({ ...form, isNew: e.target.checked })} className="accent-[#1c1a16]" /> New</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBestseller} onChange={e => setForm({ ...form, isBestseller: e.target.checked })} className="accent-[#1c1a16]" /> Bestseller</label>
        </div>
        <button onClick={save} disabled={saving || !form.name || !form.price}
          className="rounded-lg bg-[#1c1a16] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#332f28] disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editing ? 'Update' : 'Create'} Product
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1c1a16]">Products ({products.length})</h1>
        <button onClick={startCreate} className="rounded-lg bg-[#1c1a16] px-4 py-2 text-sm font-semibold text-white hover:bg-[#332f28] flex items-center gap-2"><Plus className="h-4 w-4" /> Add Product</button>
      </div>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="rounded-xl border border-[#e8e6e1] bg-white p-4 flex items-center gap-4">
            <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover border border-[#e8e6e1] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#1c1a16] truncate">{p.name}</p>
                {!p.inStock && <span className="text-[10px] font-mono uppercase text-[#c0392b] bg-red-50 px-1.5 py-0.5 rounded">Out</span>}
                {p.isNew && <span className="text-[10px] font-mono uppercase text-[#2f6fa7] bg-blue-50 px-1.5 py-0.5 rounded">New</span>}
                {p.isBestseller && <span className="text-[10px] font-mono uppercase text-[#d4a843] bg-amber-50 px-1.5 py-0.5 rounded">Best</span>}
              </div>
              <p className="text-xs text-[#958d7e]">{p.category} · {p.weight} · ₹{p.price}{p.originalPrice ? ` (MRP ₹${p.originalPrice})` : ''}</p>
            </div>
            <button onClick={() => startEdit(p)} className="h-8 w-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-[#f5f4f2]"><Pencil className="h-3.5 w-3.5 text-[#625a4f]" /></button>
            <button onClick={() => doDelete(p.id)} className="h-8 w-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 text-[#c0392b]" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
