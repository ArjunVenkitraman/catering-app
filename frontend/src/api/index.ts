import axios from 'axios';
import { ApiResponse, Dish, Ingredient, RecipeMapping, Event, GroceryList } from '../types';

const baseURL = (() => {
  const raw = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const trimmed = raw?.trim();
  if (!trimmed) return '/api/v1';
  return `${trimmed.replace(/\/+$/, '')}/api/v1`;
})();

const api = axios.create({ baseURL });

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.message || err.response?.data?.detail?.[0]?.msg || err.message;
    return Promise.reject(new Error(msg));
  }
);

const unwrap = <T>(r: { data: ApiResponse<T> }) => r.data.data as T;

// Dishes
export const getDishes = () => api.get<ApiResponse<Dish[]>>('/dishes').then(unwrap);
export const createDish = (d: Partial<Dish>) => api.post<ApiResponse<Dish>>('/dishes', d).then(unwrap);
export const updateDish = (id: number, d: Partial<Dish>) => api.put<ApiResponse<Dish>>(`/dishes/${id}`, d).then(unwrap);
export const deleteDish = (id: number) => api.delete(`/dishes/${id}`);

// Ingredients
export const getIngredients = () => api.get<ApiResponse<Ingredient[]>>('/ingredients').then(unwrap);
export const createIngredient = (d: Partial<Ingredient>) => api.post<ApiResponse<Ingredient>>('/ingredients', d).then(unwrap);
export const updateIngredient = (id: number, d: Partial<Ingredient>) => api.put<ApiResponse<Ingredient>>(`/ingredients/${id}`, d).then(unwrap);
export const deleteIngredient = (id: number) => api.delete(`/ingredients/${id}`);

// Recipes
export const getDishRecipes = (dishId: number) => api.get<ApiResponse<RecipeMapping[]>>(`/dishes/${dishId}/recipes`).then(unwrap);
export const createRecipe = (d: { dish_id: number; ingredient_id: number; quantity: number }) => api.post<ApiResponse<RecipeMapping>>('/recipes', d).then(unwrap);
export const updateRecipe = (id: number, quantity: number) => api.put<ApiResponse<RecipeMapping>>(`/recipes/${id}`, { quantity }).then(unwrap);
export const deleteRecipe = (id: number) => api.delete(`/recipes/${id}`);

// Events
export const getEvents = () => api.get<ApiResponse<Event[]>>('/events').then(unwrap);
export const getEvent = (id: number) => api.get<ApiResponse<Event>>(`/events/${id}`).then(unwrap);
export const createEvent = (d: Partial<Event> & { dish_ids: number[] }) => api.post<ApiResponse<Event>>('/events', d).then(unwrap);
export const updateEvent = (id: number, d: Partial<Event> & { dish_ids?: number[] }) => api.put<ApiResponse<Event>>(`/events/${id}`, d).then(unwrap);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`);

// Grocery
export const generateGrocery = (eventId: number, buffer: number = 0) =>
  api.post<ApiResponse<GroceryList>>(`/events/${eventId}/generate-grocery-list`, { buffer_percentage: buffer }).then(unwrap);
