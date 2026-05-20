from pydantic import BaseModel, Field
from typing import Optional, List
import datetime as dt


class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    date: dt.date
    people_count: int = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)


class EventCreate(EventBase):
    dish_ids: List[int] = Field(default_factory=list)


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    date: Optional[dt.date] = None
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
    created_at: dt.datetime

    model_config = {"from_attributes": True}
