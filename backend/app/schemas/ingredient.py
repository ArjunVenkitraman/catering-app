from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.ingredient import IngredientCategory


class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    unit: str = Field(..., min_length=1, max_length=50)
    category: IngredientCategory


class IngredientCreate(IngredientBase):
    price_per_unit: Optional[float] = Field(None, ge=0)


class IngredientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[IngredientCategory] = None
    price_per_unit: Optional[float] = Field(None, ge=0)


class IngredientResponse(IngredientBase):
    id: int
    price_per_unit: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}
