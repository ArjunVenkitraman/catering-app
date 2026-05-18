import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class IngredientCategory(str, enum.Enum):
    VEGETABLES = "Vegetables"
    GRAINS = "Grains"
    SPICES = "Spices"
    DAIRY = "Dairy"
    MEAT = "Meat"
    FRUITS = "Fruits"
    OILS = "Oils"
    OTHER = "Other"


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    unit = Column(String(50), nullable=False)
    category = Column(Enum(IngredientCategory), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    recipe_mappings = relationship(
        "RecipeMapping",
        back_populates="ingredient",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    price = relationship(
        "IngredientPrice",
        back_populates="ingredient",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
        single_parent=True,
    )
