from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.grocery import GroceryService
from app.schemas.grocery import GroceryListRequest, GroceryListResponse
from app.schemas.common import SuccessResponse


async def generate_grocery_list(event_id: int, request: GroceryListRequest, db: AsyncSession = Depends(get_db)):
    service = GroceryService(db)
    grocery_list = await service.generate(event_id, request.buffer_percentage)
    return SuccessResponse(data=grocery_list)
