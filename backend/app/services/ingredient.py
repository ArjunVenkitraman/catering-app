from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.ingredient import IngredientRepository
from app.schemas.ingredient import IngredientCreate, IngredientUpdate
from app.models.ingredient import Ingredient
from fastapi import HTTPException


class IngredientService:
    def __init__(self, db: AsyncSession):
        self.repo = IngredientRepository(db)

    async def get_all(self) -> List[Ingredient]:
        return await self.repo.get_all()

    async def get_by_id(self, ingredient_id: int) -> Ingredient:
        ing = await self.repo.get_by_id(ingredient_id)
        if not ing:
            raise HTTPException(status_code=404, detail=f"Ingredient {ingredient_id} not found")
        return ing

    async def create(self, data: IngredientCreate) -> Ingredient:
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise HTTPException(status_code=400, detail=f"Ingredient '{data.name}' already exists")
        price = data.price_per_unit
        ing_data = data.model_dump(exclude={"price_per_unit"})
        ingredient = Ingredient(**ing_data)
        ingredient = await self.repo.create(ingredient)
        if price is not None:
            await self.repo.upsert_price(ingredient.id, price)
        return await self.repo.get_by_id(ingredient.id)

    async def update(self, ingredient_id: int, data: IngredientUpdate) -> Ingredient:
        ing = await self.get_by_id(ingredient_id)
        if data.name and data.name != ing.name:
            existing = await self.repo.get_by_name(data.name)
            if existing:
                raise HTTPException(status_code=400, detail=f"Ingredient '{data.name}' already exists")
        price = data.price_per_unit
        update_data = data.model_dump(exclude_none=True, exclude={"price_per_unit"})
        for field, value in update_data.items():
            setattr(ing, field, value)
        await self.repo.update(ing)
        if price is not None:
            await self.repo.upsert_price(ingredient_id, price)
        return await self.repo.get_by_id(ingredient_id)

    async def delete(self, ingredient_id: int) -> None:
        ing = await self.get_by_id(ingredient_id)
        await self.repo.delete(ing)
