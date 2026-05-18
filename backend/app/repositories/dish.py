from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.dish import Dish


class DishRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Dish]:
        result = await self.db.execute(
            select(Dish).order_by(Dish.name)
        )
        return result.scalars().all()

    async def get_by_id(self, dish_id: int) -> Optional[Dish]:
        result = await self.db.execute(
            select(Dish).where(Dish.id == dish_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Dish]:
        result = await self.db.execute(
            select(Dish).where(Dish.name == name)
        )
        return result.scalar_one_or_none()

    async def create(self, dish: Dish) -> Dish:
        self.db.add(dish)
        await self.db.flush()
        await self.db.refresh(dish)
        return dish

    async def update(self, dish: Dish) -> Dish:
        await self.db.flush()
        await self.db.refresh(dish)
        return dish

    async def delete(self, dish: Dish) -> None:
        await self.db.delete(dish)
        await self.db.flush()
