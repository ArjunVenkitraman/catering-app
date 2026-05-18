from pydantic import BaseModel, Field
from typing import List, Optional


class GroceryItem(BaseModel):
    ingredient_id: int
    name: str
    quantity: float
    unit: str
    category: str
    price_per_unit: Optional[float] = None
    total_price: Optional[float] = None


class GroceryListRequest(BaseModel):
    buffer_percentage: float = Field(default=0.0, ge=0, le=100)


class GroceryListResponse(BaseModel):
    event_id: int
    event_name: str
    people_count: int
    buffer_percentage: float
    ingredients: List[GroceryItem]
    total_cost: Optional[float] = None


class GroceryItemEdit(BaseModel):
    ingredient_id: int
    quantity: float = Field(..., gt=0)
