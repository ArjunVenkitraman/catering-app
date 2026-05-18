from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.recipe import RecipeRepository
from app.repositories.dish import DishRepository
from app.repositories.ingredient import IngredientRepository
from app.schemas.recipe import RecipeMappingCreate, RecipeMappingUpdate
from app.models.recipe import RecipeMapping
from fastapi import HTTPException


class RecipeService:
    def __init__(self, db: AsyncSession):
        self.repo = RecipeRepository(db)
        self.dish_repo = DishRepository(db)
        self.ing_repo = IngredientRepository(db)

    async def get_by_dish(self, dish_id: int) -> List[RecipeMapping]:
        dish = await self.dish_repo.get_by_id(dish_id)
        if not dish:
            raise HTTPException(status_code=404, detail=f"Dish {dish_id} not found")
        return await self.repo.get_by_dish(dish_id)

    async def create(self, data: RecipeMappingCreate) -> RecipeMapping:
        dish = await self.dish_repo.get_by_id(data.dish_id)
        if not dish:
            raise HTTPException(status_code=404, detail=f"Dish {data.dish_id} not found")
        ing = await self.ing_repo.get_by_id(data.ingredient_id)
        if not ing:
            raise HTTPException(status_code=404, detail=f"Ingredient {data.ingredient_id} not found")
        existing = await self.repo.get_by_dish_and_ingredient(data.dish_id, data.ingredient_id)
        if existing:
            raise HTTPException(status_code=400, detail="Recipe mapping already exists for this dish-ingredient pair")
        mapping = RecipeMapping(**data.model_dump())
        return await self.repo.create(mapping)

    async def update(self, mapping_id: int, data: RecipeMappingUpdate) -> RecipeMapping:
        mapping = await self.repo.get_by_id(mapping_id)
        if not mapping:
            raise HTTPException(status_code=404, detail=f"Recipe mapping {mapping_id} not found")
        mapping.quantity = data.quantity
        return await self.repo.update(mapping)

    async def delete(self, mapping_id: int) -> None:
        mapping = await self.repo.get_by_id(mapping_id)
        if not mapping:
            raise HTTPException(status_code=404, detail=f"Recipe mapping {mapping_id} not found")
        await self.repo.delete(mapping)
