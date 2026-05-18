from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.recipe import RecipeService
from app.schemas.recipe import RecipeMappingCreate, RecipeMappingUpdate, RecipeMappingResponse
from app.schemas.common import SuccessResponse


async def get_dish_recipes(dish_id: int, db: AsyncSession = Depends(get_db)):
    service = RecipeService(db)
    mappings = await service.get_by_dish(dish_id)
    result = []
    for m in mappings:
        r = RecipeMappingResponse.model_validate(m)
        r.ingredient_name = m.ingredient.name
        r.ingredient_unit = m.ingredient.unit
        result.append(r)
    return SuccessResponse(data=result)


async def create_recipe_mapping(data: RecipeMappingCreate, db: AsyncSession = Depends(get_db)):
    service = RecipeService(db)
    mapping = await service.create(data)
    return SuccessResponse(data=RecipeMappingResponse.model_validate(mapping), message="Recipe mapping created")


async def update_recipe_mapping(mapping_id: int, data: RecipeMappingUpdate, db: AsyncSession = Depends(get_db)):
    service = RecipeService(db)
    mapping = await service.update(mapping_id, data)
    return SuccessResponse(data=RecipeMappingResponse.model_validate(mapping), message="Recipe mapping updated")


async def delete_recipe_mapping(mapping_id: int, db: AsyncSession = Depends(get_db)):
    service = RecipeService(db)
    await service.delete(mapping_id)
    return SuccessResponse(message="Recipe mapping deleted")
