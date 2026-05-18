from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.event import EventRepository
from app.schemas.event import EventCreate, EventUpdate
from app.models.event import Event
from fastapi import HTTPException


class EventService:
    def __init__(self, db: AsyncSession):
        self.repo = EventRepository(db)

    async def get_all(self) -> List[Event]:
        return await self.repo.get_all()

    async def get_by_id(self, event_id: int) -> Event:
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
        return event

    async def create(self, data: EventCreate) -> Event:
        event_data = data.model_dump(exclude={"dish_ids"})
        event = Event(**event_data)
        event = await self.repo.create(event)
        if data.dish_ids:
            await self.repo.set_event_dishes(event.id, data.dish_ids)
        return await self.repo.get_by_id(event.id)

    async def update(self, event_id: int, data: EventUpdate) -> Event:
        event = await self.get_by_id(event_id)
        update_data = data.model_dump(exclude_none=True, exclude={"dish_ids"})
        for field, value in update_data.items():
            setattr(event, field, value)
        await self.repo.update(event)
        if data.dish_ids is not None:
            await self.repo.set_event_dishes(event_id, data.dish_ids)
        return await self.repo.get_by_id(event_id)

    async def delete(self, event_id: int) -> None:
        event = await self.get_by_id(event_id)
        await self.repo.delete(event)
