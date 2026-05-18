from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.ingredient import Ingredient
from app.models.pricing import IngredientPrice


class IngredientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Ingredient]:
        result = await self.db.execute(
            select(Ingredient).options(selectinload(Ingredient.price)).order_by(Ingredient.name)
        )
        return result.scalars().all()

    async def get_by_id(self, ingredient_id: int) -> Optional[Ingredient]:
        result = await self.db.execute(
            select(Ingredient).options(selectinload(Ingredient.price)).where(Ingredient.id == ingredient_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Ingredient]:
        result = await self.db.execute(
            select(Ingredient).where(Ingredient.name == name)
        )
        return result.scalar_one_or_none()

    async def create(self, ingredient: Ingredient) -> Ingredient:
        self.db.add(ingredient)
        await self.db.flush()
        await self.db.refresh(ingredient)
        return ingredient

    async def update(self, ingredient: Ingredient) -> Ingredient:
        await self.db.flush()
        await self.db.refresh(ingredient)
        return ingredient

    async def delete(self, ingredient: Ingredient) -> None:
        await self.db.delete(ingredient)
        await self.db.flush()

    async def upsert_price(self, ingredient_id: int, price: float) -> IngredientPrice:
        result = await self.db.execute(
            select(IngredientPrice).where(IngredientPrice.ingredient_id == ingredient_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.price_per_unit = price
        else:
            existing = IngredientPrice(ingredient_id=ingredient_id, price_per_unit=price)
            self.db.add(existing)
        await self.db.flush()
        return existing
