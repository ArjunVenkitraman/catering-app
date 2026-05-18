import asyncio
from app.core.database import AsyncSessionLocal, engine, Base
from app.models import *


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Ingredients
        ingredients_data = [
            {"name": "Tomato", "unit": "kg", "category": IngredientCategory.VEGETABLES, "price": 40.0},
            {"name": "Onion", "unit": "kg", "category": IngredientCategory.VEGETABLES, "price": 30.0},
            {"name": "Green Chilli", "unit": "kg", "category": IngredientCategory.VEGETABLES, "price": 60.0},
            {"name": "Garlic", "unit": "kg", "category": IngredientCategory.VEGETABLES, "price": 120.0},
            {"name": "Ginger", "unit": "kg", "category": IngredientCategory.VEGETABLES, "price": 100.0},
            {"name": "Rice", "unit": "kg", "category": IngredientCategory.GRAINS, "price": 60.0},
            {"name": "Wheat Flour", "unit": "kg", "category": IngredientCategory.GRAINS, "price": 45.0},
            {"name": "Turmeric Powder", "unit": "kg", "category": IngredientCategory.SPICES, "price": 200.0},
            {"name": "Red Chilli Powder", "unit": "kg", "category": IngredientCategory.SPICES, "price": 180.0},
            {"name": "Coriander Powder", "unit": "kg", "category": IngredientCategory.SPICES, "price": 150.0},
            {"name": "Cooking Oil", "unit": "liter", "category": IngredientCategory.OILS, "price": 130.0},
            {"name": "Salt", "unit": "kg", "category": IngredientCategory.SPICES, "price": 20.0},
            {"name": "Chicken", "unit": "kg", "category": IngredientCategory.MEAT, "price": 220.0},
            {"name": "Lemon", "unit": "kg", "category": IngredientCategory.FRUITS, "price": 80.0},
            {"name": "Potato", "unit": "kg", "category": IngredientCategory.VEGETABLES, "price": 35.0},
        ]
        ing_map = {}
        for idata in ingredients_data:
            ing = Ingredient(name=idata["name"], unit=idata["unit"], category=idata["category"])
            db.add(ing)
            await db.flush()
            db.add(IngredientPrice(ingredient_id=ing.id, price_per_unit=idata["price"]))
            ing_map[idata["name"]] = ing.id

        # Dishes
        dishes_data = [
            {"name": "Tomato Rice", "category": DishCategory.LUNCH, "base_serving": 10, "description": "Flavourful tomato rice"},
            {"name": "Chicken Curry", "category": DishCategory.DINNER, "base_serving": 10, "description": "Spicy chicken curry"},
            {"name": "Aloo Paratha", "category": DishCategory.BREAKFAST, "base_serving": 10, "description": "Stuffed potato flatbread"},
            {"name": "Tomato Fry", "category": DishCategory.LUNCH, "base_serving": 10, "description": "Tangy tomato side dish"},
            {"name": "Samosa", "category": DishCategory.SNACKS, "base_serving": 10, "description": "Crispy potato snack"},
        ]
        dish_map = {}
        for ddata in dishes_data:
            d = Dish(**ddata)
            db.add(d)
            await db.flush()
            dish_map[ddata["name"]] = d.id

        # Recipes
        recipes = [
            # Tomato Rice (base 10)
            (dish_map["Tomato Rice"], ing_map["Rice"], 2.0),
            (dish_map["Tomato Rice"], ing_map["Tomato"], 1.5),
            (dish_map["Tomato Rice"], ing_map["Onion"], 0.5),
            (dish_map["Tomato Rice"], ing_map["Cooking Oil"], 0.2),
            (dish_map["Tomato Rice"], ing_map["Salt"], 0.05),
            (dish_map["Tomato Rice"], ing_map["Turmeric Powder"], 0.02),
            # Chicken Curry (base 10)
            (dish_map["Chicken Curry"], ing_map["Chicken"], 2.5),
            (dish_map["Chicken Curry"], ing_map["Onion"], 0.8),
            (dish_map["Chicken Curry"], ing_map["Tomato"], 0.6),
            (dish_map["Chicken Curry"], ing_map["Garlic"], 0.1),
            (dish_map["Chicken Curry"], ing_map["Ginger"], 0.1),
            (dish_map["Chicken Curry"], ing_map["Red Chilli Powder"], 0.05),
            (dish_map["Chicken Curry"], ing_map["Coriander Powder"], 0.05),
            (dish_map["Chicken Curry"], ing_map["Cooking Oil"], 0.3),
            # Aloo Paratha (base 10)
            (dish_map["Aloo Paratha"], ing_map["Wheat Flour"], 1.5),
            (dish_map["Aloo Paratha"], ing_map["Potato"], 1.0),
            (dish_map["Aloo Paratha"], ing_map["Green Chilli"], 0.05),
            (dish_map["Aloo Paratha"], ing_map["Cooking Oil"], 0.2),
            (dish_map["Aloo Paratha"], ing_map["Salt"], 0.03),
            # Tomato Fry (base 10)
            (dish_map["Tomato Fry"], ing_map["Tomato"], 6.0),
            (dish_map["Tomato Fry"], ing_map["Green Chilli"], 0.2),
            (dish_map["Tomato Fry"], ing_map["Cooking Oil"], 0.15),
            (dish_map["Tomato Fry"], ing_map["Salt"], 0.04),
            # Samosa (base 10)
            (dish_map["Samosa"], ing_map["Wheat Flour"], 0.5),
            (dish_map["Samosa"], ing_map["Potato"], 0.8),
            (dish_map["Samosa"], ing_map["Green Chilli"], 0.03),
            (dish_map["Samosa"], ing_map["Cooking Oil"], 0.3),
        ]
        for dish_id, ing_id, qty in recipes:
            db.add(RecipeMapping(dish_id=dish_id, ingredient_id=ing_id, quantity=qty))

        await db.commit()
        print("✅ Seed data inserted successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
