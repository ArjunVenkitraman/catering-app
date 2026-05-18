import { useState, useEffect } from 'react';
import { ShoppingBasket, RefreshCw, Printer, Pencil, Check, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { getEvents, generateGrocery } from '../api';
import { Event, GroceryItem, GroceryList } from '../types';

const CAT_COLORS: Record<string, string> = {
  Vegetables: 'text-green-600 bg-green-50 border-green-200',
  Grains: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  Spices: 'text-red-600 bg-red-50 border-red-200',
  Dairy: 'text-blue-600 bg-blue-50 border-blue-200',
  Meat: 'text-rose-600 bg-rose-50 border-rose-200',
  Fruits: 'text-pink-600 bg-pink-50 border-pink-200',
  Oils: 'text-amber-700 bg-amber-50 border-amber-200',
  Other: 'text-gray-600 bg-gray-50 border-gray-200',
};

export default function GroceryPage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [buffer, setBuffer] = useState(0);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [editItems, setEditItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');

  useEffect(() => {
    getEvents().then(e => {
      setEvents(e);
      const eid = searchParams.get('event_id');
      if (eid) setSelectedEventId(parseInt(eid));
    });
  }, []);

  const generate = async () => {
    if (!selectedEventId) return toast.error('Select an event');
    setLoading(true);
    try {
      const list = await generateGrocery(selectedEventId, buffer);
      setGroceryList(list);
      setEditItems(list.ingredients.map(i => ({ ...i })));
      toast.success('Grocery list generated!');
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const startEdit = (item: GroceryItem) => { setEditingId(item.ingredient_id); setEditQty(item.quantity.toString()); };
  const saveEdit = (id: number) => {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) return toast.error('Invalid quantity');
    setEditItems(prev => prev.map(i => i.ingredient_id === id ? {
      ...i, quantity: qty,
      total_price: i.price_per_unit != null ? parseFloat((qty * i.price_per_unit).toFixed(2)) : i.total_price
    } : i));
    setEditingId(null);
  };

  const totalCost = editItems.reduce((s, i) => s + (i.total_price || 0), 0);
  const grouped = editItems.reduce<Record<string, GroceryItem[]>>((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i); return acc;
  }, {});

  const printList = () => {
    if (!groceryList) return;
    const content = `
      <html><head><title>Grocery List - ${groceryList.event_name}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 24px; margin-bottom: 5px; }
        .meta { color: #666; margin-bottom: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; border-bottom: 2px solid #000; padding: 8px 4px; font-size: 12px; text-transform: uppercase; }
        td { padding: 8px 4px; border-bottom: 1px solid #eee; font-size: 14px; }
        .total { margin-top: 20px; font-weight: bold; text-align: right; font-size: 16px; }
        .cat-header { background: #f5f5f5; font-weight: bold; padding: 6px 4px; margin-top: 10px; font-size: 13px; }
      </style></head><body>
      <h1>Grocery List</h1>
      <div class="meta">Event: ${groceryList.event_name} | People: ${groceryList.people_count} | Buffer: ${groceryList.buffer_percentage}%</div>
      <table><thead><tr><th>Ingredient</th><th>Quantity</th><th>Unit</th><th>Price</th></tr></thead><tbody>
      ${Object.entries(grouped).map(([cat, items]) =>
        `<tr><td colspan="4" class="cat-header">${cat}</td></tr>` +
        items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.unit}</td><td>${i.total_price ? '₹'+i.total_price : '—'}</td></tr>`).join('')
      ).join('')}
      </tbody></table>
      ${totalCost > 0 ? `<div class="total">Total Estimated Cost: ₹${totalCost.toFixed(2)}</div>` : ''}
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); w.print(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Grocery List</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and manage shopping lists for events</p>
        </div>
        {groceryList && (
          <button onClick={printList} className="btn-ghost flex items-center gap-2 text-sm">
            <Printer size={16} /> Print
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Select Event</label>
            <select className="input" value={selectedEventId || ''} onChange={e => setSelectedEventId(parseInt(e.target.value) || null)}>
              <option value="">Choose event...</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.people_count} ppl)</option>)}
            </select>
          </div>
          <div>
            <label className="label">Buffer % (optional)</label>
            <div className="relative">
              <input className="input pr-8" type="number" min={0} max={100} value={buffer} onChange={e => setBuffer(parseFloat(e.target.value) || 0)} placeholder="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <button className="btn-primary flex items-center justify-center gap-2 h-10" onClick={generate} disabled={loading}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><ShoppingBasket size={16} /> Generate List</>}
          </button>
        </div>
      </div>

      {groceryList && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Event', value: groceryList.event_name },
              { label: 'People', value: groceryList.people_count },
              { label: 'Items', value: editItems.length },
              { label: 'Est. Cost', value: totalCost > 0 ? `₹${totalCost.toFixed(2)}` : '—' },
            ].map(s => (
              <div key={s.label} className="card py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-xl font-display font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Grocery items by category */}
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="card p-0 overflow-hidden">
                <div className={`px-5 py-3 border-b flex items-center justify-between ${CAT_COLORS[cat] || 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-medium text-sm">{cat}</span>
                  <span className="text-xs opacity-70">{items.length} items</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium text-gray-500 text-xs">Ingredient</th>
                      <th className="text-right px-5 py-2 font-medium text-gray-500 text-xs">Quantity</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500 text-xs">Unit</th>
                      <th className="text-right px-5 py-2 font-medium text-gray-500 text-xs">Price/Unit</th>
                      <th className="text-right px-5 py-2 font-medium text-gray-500 text-xs">Total</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.ingredient_id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium">{item.name}</td>
                        <td className="px-5 py-3 text-right">
                          {editingId === item.ingredient_id ? (
                            <input className="input w-24 text-right font-mono" value={editQty} onChange={e => setEditQty(e.target.value)} autoFocus />
                          ) : (
                            <span className="font-mono">{item.quantity}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-500">{item.unit}</td>
                        <td className="px-5 py-3 text-right text-gray-500 font-mono">{item.price_per_unit != null ? `₹${item.price_per_unit}` : '—'}</td>
                        <td className="px-5 py-3 text-right font-mono font-medium">{item.total_price != null ? `₹${item.total_price}` : '—'}</td>
                        <td className="px-3 py-3">
                          {editingId === item.ingredient_id ? (
                            <div className="flex gap-1">
                              <button onClick={() => saveEdit(item.ingredient_id)} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><X size={14} /></button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(item)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400"><Pencil size={13} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {totalCost > 0 && (
            <div className="card mt-4 flex items-center justify-between bg-gradient-to-r from-forest-50 to-forest-100 border-forest-200">
              <span className="font-display font-semibold text-forest-800">Total Estimated Cost</span>
              <span className="text-2xl font-display font-bold text-forest-700">₹{totalCost.toFixed(2)}</span>
            </div>
          )}
        </>
      )}

      {!groceryList && (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBasket size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-display">Select an event and generate your grocery list</p>
          <p className="text-sm mt-1">Quantities are automatically calculated based on your recipes</p>
        </div>
      )}
    </div>
  );
}
