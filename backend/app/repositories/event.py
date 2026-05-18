from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.event import Event, EventDish
from app.models.dish import Dish
from app.models.recipe import RecipeMapping
from app.models.ingredient import Ingredient
from app.models.pricing import IngredientPrice


class EventRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Event]:
        result = await self.db.execute(
            select(Event)
            .options(
                selectinload(Event.event_dishes).selectinload(EventDish.dish)
            )
            .order_by(Event.date.desc())
        )
        return result.scalars().all()

    async def get_by_id(self, event_id: int) -> Optional[Event]:
        result = await self.db.execute(
            select(Event)
            .options(
                selectinload(Event.event_dishes).selectinload(EventDish.dish)
            )
            .where(Event.id == event_id)
        )
        return result.scalar_one_or_none()

    async def create(self, event: Event) -> Event:
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def update(self, event: Event) -> Event:
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def delete(self, event: Event) -> None:
        await self.db.delete(event)
        await self.db.flush()

    async def set_event_dishes(self, event_id: int, dish_ids: List[int]) -> None:
        await self.db.execute(delete(EventDish).where(EventDish.event_id == event_id))
        for dish_id in dish_ids:
            self.db.add(EventDish(event_id=event_id, dish_id=dish_id))
        await self.db.flush()

    async def get_event_recipes(self, event_id: int):
        result = await self.db.execute(
            select(EventDish, RecipeMapping, Ingredient, Dish, IngredientPrice)
            .join(Dish, EventDish.dish_id == Dish.id)
            .join(RecipeMapping, RecipeMapping.dish_id == Dish.id)
            .join(Ingredient, RecipeMapping.ingredient_id == Ingredient.id)
            .outerjoin(IngredientPrice, IngredientPrice.ingredient_id == Ingredient.id)
            .where(EventDish.event_id == event_id)
        )
        return result.all()
