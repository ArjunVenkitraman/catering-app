from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RecipeMappingBase(BaseModel):
    dish_id: int
    ingredient_id: int
    quantity: float = Field(..., gt=0)


class RecipeMappingCreate(RecipeMappingBase):
    pass


class RecipeMappingUpdate(BaseModel):
    quantity: float = Field(..., gt=0)


class RecipeMappingResponse(RecipeMappingBase):
    id: int
    ingredient_name: Optional[str] = None
    ingredient_unit: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
