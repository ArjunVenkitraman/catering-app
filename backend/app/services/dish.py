from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.dish import DishRepository
from app.schemas.dish import DishCreate, DishUpdate
from app.models.dish import Dish
from fastapi import HTTPException


class DishService:
    def __init__(self, db: AsyncSession):
        self.repo = DishRepository(db)

    async def get_all(self) -> List[Dish]:
        return await self.repo.get_all()

    async def get_by_id(self, dish_id: int) -> Dish:
        dish = await self.repo.get_by_id(dish_id)
        if not dish:
            raise HTTPException(status_code=404, detail=f"Dish {dish_id} not found")
        return dish

    async def create(self, data: DishCreate) -> Dish:
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise HTTPException(status_code=400, detail=f"Dish '{data.name}' already exists")
        dish = Dish(**data.model_dump())
        return await self.repo.create(dish)

    async def update(self, dish_id: int, data: DishUpdate) -> Dish:
        dish = await self.get_by_id(dish_id)
        if data.name and data.name != dish.name:
            existing = await self.repo.get_by_name(data.name)
            if existing:
                raise HTTPException(status_code=400, detail=f"Dish '{data.name}' already exists")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(dish, field, value)
        return await self.repo.update(dish)

    async def delete(self, dish_id: int) -> None:
        dish = await self.get_by_id(dish_id)
        await self.repo.delete(dish)
