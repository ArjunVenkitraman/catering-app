from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.recipe import RecipeMapping
from app.models.ingredient import Ingredient
from app.models.pricing import IngredientPrice


class RecipeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_dish(self, dish_id: int) -> List[RecipeMapping]:
        result = await self.db.execute(
            select(RecipeMapping)
            .options(
                selectinload(RecipeMapping.ingredient).selectinload(Ingredient.price)
            )
            .where(RecipeMapping.dish_id == dish_id)
        )
        return result.scalars().all()

    async def get_by_id(self, mapping_id: int) -> Optional[RecipeMapping]:
        result = await self.db.execute(
            select(RecipeMapping).where(RecipeMapping.id == mapping_id)
        )
        return result.scalar_one_or_none()

    async def get_by_dish_and_ingredient(self, dish_id: int, ingredient_id: int) -> Optional[RecipeMapping]:
        result = await self.db.execute(
            select(RecipeMapping).where(
                RecipeMapping.dish_id == dish_id,
                RecipeMapping.ingredient_id == ingredient_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, mapping: RecipeMapping) -> RecipeMapping:
        self.db.add(mapping)
        await self.db.flush()
        await self.db.refresh(mapping)
        return mapping

    async def update(self, mapping: RecipeMapping) -> RecipeMapping:
        await self.db.flush()
        await self.db.refresh(mapping)
        return mapping

    async def delete(self, mapping: RecipeMapping) -> None:
        await self.db.delete(mapping)
        await self.db.flush()
