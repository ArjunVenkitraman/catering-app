from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.dish import DishService
from app.schemas.dish import DishCreate, DishUpdate, DishResponse
from app.schemas.common import SuccessResponse
from typing import List


async def get_all_dishes(db: AsyncSession = Depends(get_db)):
    service = DishService(db)
    dishes = await service.get_all()
    return SuccessResponse(data=[DishResponse.model_validate(d) for d in dishes])


async def get_dish(dish_id: int, db: AsyncSession = Depends(get_db)):
    service = DishService(db)
    dish = await service.get_by_id(dish_id)
    return SuccessResponse(data=DishResponse.model_validate(dish))


async def create_dish(data: DishCreate, db: AsyncSession = Depends(get_db)):
    service = DishService(db)
    dish = await service.create(data)
    return SuccessResponse(data=DishResponse.model_validate(dish), message="Dish created successfully")


async def update_dish(dish_id: int, data: DishUpdate, db: AsyncSession = Depends(get_db)):
    service = DishService(db)
    dish = await service.update(dish_id, data)
    return SuccessResponse(data=DishResponse.model_validate(dish), message="Dish updated successfully")


async def delete_dish(dish_id: int, db: AsyncSession = Depends(get_db)):
    service = DishService(db)
    await service.delete(dish_id)
    return SuccessResponse(message="Dish deleted successfully")
