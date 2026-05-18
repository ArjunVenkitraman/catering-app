import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChefHat, BookOpen, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDishes, createDish, updateDish, deleteDish, getDishRecipes, createRecipe, updateRecipe, deleteRecipe, getIngredients } from '../api';
import { Dish, RecipeMapping, Ingredient, DishCategory } from '../types';

const CATEGORIES: DishCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const CAT_COLORS: Record<DishCategory, string> = {
  Breakfast: 'bg-amber-100 text-amber-700',
  Lunch: 'bg-green-100 text-green-700',
  Dinner: 'bg-indigo-100 text-indigo-700',
  Snacks: 'bg-orange-100 text-orange-700',
};

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Lunch' as DishCategory, base_serving: 10, description: '' });
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [recipes, setRecipes] = useState<RecipeMapping[]>([]);
  const [recipeForm, setRecipeForm] = useState({ ingredient_id: 0, quantity: '' });

  const load = async () => {
    const [d, i] = await Promise.all([getDishes(), getIngredients()]);
    setDishes(d); setIngredients(i); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (d: Dish) => { setEditing(d); setForm({ name: d.name, category: d.category, base_serving: d.base_serving, description: d.description || '' }); setShowForm(true); };
  const resetForm = () => { setEditing(null); setForm({ name: '', category: 'Lunch', base_serving: 10, description: '' }); setShowForm(false); };

  const submit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    try {
      if (editing) { await updateDish(editing.id, form); toast.success('Dish updated'); }
      else { await createDish(form); toast.success('Dish created'); }
      resetForm(); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this dish?')) return;
    try { await deleteDish(id); toast.success('Deleted'); load(); } catch (e: any) { toast.error(e.message); }
  };

  const openRecipes = async (d: Dish) => {
    setSelectedDish(d);
    const r = await getDishRecipes(d.id);
    setRecipes(r);
  };

  const addRecipe = async () => {
    if (!recipeForm.ingredient_id || !recipeForm.quantity) return toast.error('Fill all fields');
    try {
      await createRecipe({ dish_id: selectedDish!.id, ingredient_id: recipeForm.ingredient_id, quantity: parseFloat(recipeForm.quantity) });
      const r = await getDishRecipes(selectedDish!.id); setRecipes(r);
      setRecipeForm({ ingredient_id: 0, quantity: '' });
      toast.success('Ingredient added');
    } catch (e: any) { toast.error(e.message); }
  };

  const removeRecipe = async (id: number) => {
    try { await deleteRecipe(id); const r = await getDishRecipes(selectedDish!.id); setRecipes(r); toast.success('Removed'); }
    catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Dishes</h2>
          <p className="text-sm text-gray-500 mt-1">{dishes.length} dishes in your menu</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold">{editing ? 'Edit Dish' : 'New Dish'}</h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label">Dish Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Tomato Rice" /></div>
              <div><label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value as DishCategory})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Base Serving (people)</label><input className="input" type="number" min={1} value={form.base_serving} onChange={e => setForm({...form, base_serving: parseInt(e.target.value) || 10})} /></div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={submit}><Check size={16} /> Save</button>
                <button className="btn-ghost flex-1" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDish && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-bold">{selectedDish.name} — Recipe</h3>
                <p className="text-xs text-gray-500">Base serving: {selectedDish.base_serving} people</p>
              </div>
              <button onClick={() => setSelectedDish(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recipes.length === 0 ? <p className="text-sm text-gray-400 py-4 text-center">No ingredients yet</p> :
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 font-medium text-gray-500">Ingredient</th><th className="text-right py-2 font-medium text-gray-500">Qty</th><th className="text-right py-2 font-medium text-gray-500">Unit</th><th className="py-2"></th></tr></thead>
                  <tbody>{recipes.map(r => (
                    <tr key={r.id} className="border-b border-gray-50">
                      <td className="py-2">{r.ingredient_name}</td>
                      <td className="py-2 text-right font-mono">{r.quantity}</td>
                      <td className="py-2 text-right text-gray-500">{r.ingredient_unit}</td>
                      <td className="py-2 text-right"><button onClick={() => removeRecipe(r.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              }
            </div>
            <div className="pt-4 border-t mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Add Ingredient</p>
              <div className="flex gap-2">
                <select className="input flex-1" value={recipeForm.ingredient_id} onChange={e => setRecipeForm({...recipeForm, ingredient_id: parseInt(e.target.value)})}>
                  <option value={0}>Select ingredient...</option>
                  {ingredients.filter(i => !recipes.some(r => r.ingredient_id === i.id)).map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                </select>
                <input className="input w-24" type="number" step="0.01" placeholder="Qty" value={recipeForm.quantity} onChange={e => setRecipeForm({...recipeForm, quantity: e.target.value})} />
                <button className="btn-primary" onClick={addRecipe}><Plus size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map(d => (
          <div key={d.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-gray-900">{d.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{d.base_serving} people base serving</p>
              </div>
              <span className={`badge ${CAT_COLORS[d.category]}`}>{d.category}</span>
            </div>
            {d.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{d.description}</p>}
            <div className="flex gap-2 pt-2 border-t border-gray-50">
              <button onClick={() => openRecipes(d)} className="btn-ghost text-xs flex items-center gap-1.5 flex-1 justify-center">
                <BookOpen size={14} /> Recipe
              </button>
              <button onClick={() => openEdit(d)} className="btn-ghost text-xs flex items-center gap-1.5"><Pencil size={14} /></button>
              <button onClick={() => remove(d.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {dishes.length === 0 && <div className="text-center py-20 text-gray-400"><ChefHat size={40} className="mx-auto mb-3 opacity-30" /><p>No dishes yet. Add your first dish!</p></div>}
    </div>
  );
}
