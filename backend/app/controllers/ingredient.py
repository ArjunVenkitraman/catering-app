from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ingredient import IngredientService
from app.schemas.ingredient import IngredientCreate, IngredientUpdate, IngredientResponse
from app.schemas.common import SuccessResponse


async def get_all_ingredients(db: AsyncSession = Depends(get_db)):
    service = IngredientService(db)
    items = await service.get_all()
    result = []
    for ing in items:
        r = IngredientResponse.model_validate(ing)
        r.price_per_unit = ing.price.price_per_unit if ing.price else None
        result.append(r)
    return SuccessResponse(data=result)


async def get_ingredient(ingredient_id: int, db: AsyncSession = Depends(get_db)):
    service = IngredientService(db)
    ing = await service.get_by_id(ingredient_id)
    r = IngredientResponse.model_validate(ing)
    r.price_per_unit = ing.price.price_per_unit if ing.price else None
    return SuccessResponse(data=r)


async def create_ingredient(data: IngredientCreate, db: AsyncSession = Depends(get_db)):
    service = IngredientService(db)
    ing = await service.create(data)
    r = IngredientResponse.model_validate(ing)
    r.price_per_unit = ing.price.price_per_unit if ing.price else None
    return SuccessResponse(data=r, message="Ingredient created successfully")


async def update_ingredient(ingredient_id: int, data: IngredientUpdate, db: AsyncSession = Depends(get_db)):
    service = IngredientService(db)
    ing = await service.update(ingredient_id, data)
    r = IngredientResponse.model_validate(ing)
    r.price_per_unit = ing.price.price_per_unit if ing.price else None
    return SuccessResponse(data=r, message="Ingredient updated successfully")


async def delete_ingredient(ingredient_id: int, db: AsyncSession = Depends(get_db)):
    service = IngredientService(db)
    await service.delete(ingredient_id)
    return SuccessResponse(message="Ingredient deleted successfully")
