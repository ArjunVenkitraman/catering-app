from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    date: date
    people_count: int = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)


class EventCreate(EventBase):
    dish_ids: List[int] = Field(default_factory=list)


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    date: Optional[date] = None
    people_count: Optional[int] = Field(None, gt=0)
    description: Optional[str] = None
    dish_ids: Optional[List[int]] = None


class EventDishResponse(BaseModel):
    id: int
    dish_id: int
    dish_name: str

    model_config = {"from_attributes": True}


class EventResponse(EventBase):
    id: int
    dishes: List[EventDishResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
