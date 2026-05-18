export type DishCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
export type IngredientCategory = 'Vegetables' | 'Grains' | 'Spices' | 'Dairy' | 'Meat' | 'Fruits' | 'Oils' | 'Other';

export interface Dish {
  id: number;
  name: string;
  category: DishCategory;
  base_serving: number;
  description?: string;
  created_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  category: IngredientCategory;
  price_per_unit?: number;
  created_at: string;
}

export interface RecipeMapping {
  id: number;
  dish_id: number;
  ingredient_id: number;
  quantity: number;
  ingredient_name?: string;
  ingredient_unit?: string;
  created_at: string;
}

export interface EventDish {
  id: number;
  dish_id: number;
  dish_name: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  people_count: number;
  description?: string;
  dishes: EventDish[];
  created_at: string;
}

export interface GroceryItem {
  ingredient_id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  price_per_unit?: number;
  total_price?: number;
}

export interface GroceryList {
  event_id: number;
  event_name: string;
  people_count: number;
  buffer_percentage: number;
  ingredients: GroceryItem[];
  total_cost?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
