import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, ShoppingBasket, X, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getEvents, createEvent, updateEvent, deleteEvent, getDishes } from '../api';
import { Event, Dish } from '../types';
import { format } from 'date-fns';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ name: '', date: '', people_count: 50, description: '', dish_ids: [] as number[] });
  const navigate = useNavigate();

  const load = async () => {
    const [e, d] = await Promise.all([getEvents(), getDishes()]);
    setEvents(e); setDishes(d); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (e: Event) => {
    setEditing(e);
    setForm({ name: e.name, date: e.date, people_count: e.people_count, description: e.description || '', dish_ids: e.dishes.map(d => d.dish_id) });
    setShowForm(true);
  };
  const reset = () => { setEditing(null); setForm({ name: '', date: '', people_count: 50, description: '', dish_ids: [] }); setShowForm(false); };

  const toggleDish = (id: number) => {
    setForm(f => ({ ...f, dish_ids: f.dish_ids.includes(id) ? f.dish_ids.filter(x => x !== id) : [...f.dish_ids, id] }));
  };

  const submit = async () => {
    if (!form.name.trim() || !form.date) return toast.error('Name and date required');
    try {
      if (editing) { await updateEvent(editing.id, form); toast.success('Event updated'); }
      else { await createEvent(form); toast.success('Event created'); }
      reset(); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try { await deleteEvent(id); toast.success('Deleted'); load(); } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Events</h2>
          <p className="text-sm text-gray-500 mt-1">{events.length} catering events</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}><Plus size={16} /> New Event</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold">{editing ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={reset} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div><label className="label">Event Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Wedding Reception" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div><label className="label">Number of People</label><input className="input" type="number" min={1} value={form.people_count} onChange={e => setForm({...form, people_count: parseInt(e.target.value) || 1})} /></div>
              </div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div>
                <label className="label">Select Dishes ({form.dish_ids.length} selected)</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {dishes.map(d => (
                    <button key={d.id} onClick={() => toggleDish(d.id)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${form.dish_ids.includes(d.id) ? 'bg-saffron-50 border-saffron-300 text-saffron-800' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-400">{d.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t mt-4">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={submit}><Check size={16} /> Save Event</button>
              <button className="btn-ghost flex-1" onClick={reset}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map(e => (
          <div key={e.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-gray-900">{e.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{format(new Date(e.date), 'dd MMM yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users size={14} className="text-saffron-500" />{e.people_count} people
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <CalendarDays size={14} className="text-forest-500" />{e.dishes.length} dishes
              </div>
            </div>
            {e.dishes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {e.dishes.slice(0,3).map(d => <span key={d.id} className="badge bg-saffron-50 text-saffron-700">{d.dish_name}</span>)}
                {e.dishes.length > 3 && <span className="badge bg-gray-100 text-gray-500">+{e.dishes.length - 3}</span>}
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-gray-50">
              <button onClick={() => navigate(`/grocery?event_id=${e.id}`)} className="btn-secondary text-xs flex items-center gap-1.5 flex-1 justify-center">
                <ShoppingBasket size={14} /> Grocery List
              </button>
              <button onClick={() => openEdit(e)} className="btn-ghost text-xs flex items-center gap-1.5"><Pencil size={14} /></button>
              <button onClick={() => remove(e.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <div className="text-center py-20 text-gray-400"><CalendarDays size={40} className="mx-auto mb-3 opacity-30" /><p>No events yet. Create your first catering event!</p></div>}
    </div>
  );
}
