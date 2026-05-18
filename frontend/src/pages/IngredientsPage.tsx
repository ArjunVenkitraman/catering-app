import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Carrot, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api';
import { Ingredient, IngredientCategory } from '../types';

const CATEGORIES: IngredientCategory[] = ['Vegetables','Grains','Spices','Dairy','Meat','Fruits','Oils','Other'];
const UNITS = ['kg','liter','grams','ml','pieces','bunch','litre'];
const CAT_COLORS: Record<IngredientCategory, string> = {
  Vegetables:'bg-green-100 text-green-700', Grains:'bg-yellow-100 text-yellow-700',
  Spices:'bg-red-100 text-red-700', Dairy:'bg-blue-100 text-blue-700',
  Meat:'bg-rose-100 text-rose-700', Fruits:'bg-pink-100 text-pink-700',
  Oils:'bg-amber-100 text-amber-700', Other:'bg-gray-100 text-gray-700',
};

export default function IngredientsPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [form, setForm] = useState({ name: '', unit: 'kg', category: 'Vegetables' as IngredientCategory, price_per_unit: '' });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = async () => { setItems(await getIngredients()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openEdit = (i: Ingredient) => {
    setEditing(i);
    setForm({ name: i.name, unit: i.unit, category: i.category, price_per_unit: i.price_per_unit?.toString() || '' });
    setShowForm(true);
  };
  const reset = () => { setEditing(null); setForm({ name: '', unit: 'kg', category: 'Vegetables', price_per_unit: '' }); setShowForm(false); };

  const submit = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    const payload = { ...form, price_per_unit: form.price_per_unit ? parseFloat(form.price_per_unit) : undefined };
    try {
      if (editing) { await updateIngredient(editing.id, payload); toast.success('Updated'); }
      else { await createIngredient(payload); toast.success('Created'); }
      reset(); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete?')) return;
    try { await deleteIngredient(id); toast.success('Deleted'); load(); } catch (e: any) { toast.error(e.message); }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterCat || i.category === filterCat)
  );

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Ingredients</h2>
          <p className="text-sm text-gray-500 mt-1">{items.length} ingredients in inventory</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}><Plus size={16} /> Add Ingredient</button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input className="input max-w-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-40" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold">{editing ? 'Edit Ingredient' : 'New Ingredient'}</h3>
              <button onClick={reset} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Tomato" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Unit</label>
                  <select className="input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div><label className="label">Price per unit (₹)</label>
                  <input className="input" type="number" step="0.01" value={form.price_per_unit} onChange={e => setForm({...form, price_per_unit: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div><label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value as IngredientCategory})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={submit}><Check size={16} /> Save</button>
                <button className="btn-ghost flex-1" onClick={reset}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Unit</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Price/Unit</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium">{i.name}</td>
                <td className="px-5 py-3"><span className={`badge ${CAT_COLORS[i.category]}`}>{i.category}</span></td>
                <td className="px-5 py-3 text-gray-500">{i.unit}</td>
                <td className="px-5 py-3 text-right font-mono">{i.price_per_unit != null ? `₹${i.price_per_unit}` : '—'}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"><Pencil size={14} /></button>
                    <button onClick={() => remove(i.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400"><Carrot size={36} className="mx-auto mb-3 opacity-30" /><p>No ingredients found</p></div>}
      </div>
    </div>
  );
}
