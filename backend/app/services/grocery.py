from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.event import EventRepository
from app.schemas.grocery import GroceryItem, GroceryListResponse
from fastapi import HTTPException


class GroceryService:
    def __init__(self, db: AsyncSession):
        self.repo = EventRepository(db)

    async def generate(self, event_id: int, buffer_percentage: float = 0.0) -> GroceryListResponse:
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
        if not event.event_dishes:
            raise HTTPException(status_code=400, detail="No dishes selected for this event")

        rows = await self.repo.get_event_recipes(event_id)
        if not rows:
            raise HTTPException(status_code=400, detail="No recipes found for the selected dishes")

        # Aggregate: ingredient_id -> aggregated data
        aggregated: Dict[int, dict] = {}
        for event_dish, recipe, ingredient, dish, price_obj in rows:
            people = event.people_count
            base_serving = dish.base_serving
            base_qty = recipe.quantity
            required_qty = (people / base_serving) * base_qty

            if buffer_percentage > 0:
                required_qty *= (1 + buffer_percentage / 100)

            iid = ingredient.id
            if iid not in aggregated:
                aggregated[iid] = {
                    "ingredient_id": iid,
                    "name": ingredient.name,
                    "unit": ingredient.unit,
                    "category": ingredient.category.value,
                    "quantity": 0.0,
                    "price_per_unit": price_obj.price_per_unit if price_obj else None,
                }
            aggregated[iid]["quantity"] += required_qty

        items = []
        total_cost = 0.0
        has_price = False
        for data in aggregated.values():
            qty = round(data["quantity"], 3)
            ppu = data["price_per_unit"]
            total_price = round(qty * ppu, 2) if ppu is not None else None
            if total_price is not None:
                total_cost += total_price
                has_price = True
            items.append(GroceryItem(
                ingredient_id=data["ingredient_id"],
                name=data["name"],
                quantity=qty,
                unit=data["unit"],
                category=data["category"],
                price_per_unit=ppu,
                total_price=total_price,
            ))

        items.sort(key=lambda x: x.name)

        return GroceryListResponse(
            event_id=event_id,
            event_name=event.name,
            people_count=event.people_count,
            buffer_percentage=buffer_percentage,
            ingredients=items,
            total_cost=round(total_cost, 2) if has_price else None,
        )
