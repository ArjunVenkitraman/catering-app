from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.event import EventService
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventDishResponse
from app.schemas.common import SuccessResponse


async def get_all_events(db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    events = await service.get_all()
    result = []
    for e in events:
        er = EventResponse.model_validate(e)
        er.dishes = [EventDishResponse(id=ed.id, dish_id=ed.dish_id, dish_name=ed.dish.name) for ed in e.event_dishes]
        result.append(er)
    return SuccessResponse(data=result)


async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    e = await service.get_by_id(event_id)
    er = EventResponse.model_validate(e)
    er.dishes = [EventDishResponse(id=ed.id, dish_id=ed.dish_id, dish_name=ed.dish.name) for ed in e.event_dishes]
    return SuccessResponse(data=er)


async def create_event(data: EventCreate, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    e = await service.create(data)
    er = EventResponse.model_validate(e)
    er.dishes = [EventDishResponse(id=ed.id, dish_id=ed.dish_id, dish_name=ed.dish.name) for ed in e.event_dishes]
    return SuccessResponse(data=er, message="Event created successfully")


async def update_event(event_id: int, data: EventUpdate, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    e = await service.update(event_id, data)
    er = EventResponse.model_validate(e)
    er.dishes = [EventDishResponse(id=ed.id, dish_id=ed.dish_id, dish_name=ed.dish.name) for ed in e.event_dishes]
    return SuccessResponse(data=er, message="Event updated successfully")


async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    await service.delete(event_id)
    return SuccessResponse(message="Event deleted successfully")
