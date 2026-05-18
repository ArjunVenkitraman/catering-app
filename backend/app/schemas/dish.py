from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.dish import DishCategory


class DishBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: DishCategory
    base_serving: int = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)


class DishCreate(DishBase):
    pass


class DishUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[DishCategory] = None
    base_serving: Optional[int] = Field(None, gt=0)
    description: Optional[str] = None


class DishResponse(DishBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
