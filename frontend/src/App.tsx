import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChefHat, Carrot, CalendarDays, ShoppingBasket, Menu, X } from 'lucide-react';
import { useState } from 'react';
import DishesPage from './pages/DishesPage';
import IngredientsPage from './pages/IngredientsPage';
import EventsPage from './pages/EventsPage';
import GroceryPage from './pages/GroceryPage';

const navItems = [
  { path: '/dishes', label: 'Dishes', icon: ChefHat },
  { path: '/ingredients', label: 'Ingredients', icon: Carrot },
  { path: '/events', label: 'Events', icon: CalendarDays },
  { path: '/grocery', label: 'Grocery', icon: ShoppingBasket },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' } }} />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-cream-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-xl flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-gray-900 leading-none">Catering Planner</h1>
                <p className="text-xs text-gray-400 leading-none mt-0.5">Grocery Management System</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink key={path} to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive ? 'bg-saffron-50 text-saffron-700' : 'text-gray-600 hover:text-saffron-600 hover:bg-saffron-50'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink key={path} to={path} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-saffron-50 text-saffron-700' : 'text-gray-600'}`
                  }
                >
                  <Icon size={16} />{label}
                </NavLink>
              ))}
            </div>
          )}
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/dishes" element={<DishesPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/grocery" element={<GroceryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
