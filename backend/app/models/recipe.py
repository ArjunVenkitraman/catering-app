from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class RecipeMapping(Base):
    __tablename__ = "recipe_mappings"
    __table_args__ = (UniqueConstraint("dish_id", "ingredient_id", name="uq_dish_ingredient"),)

    id = Column(Integer, primary_key=True, index=True)
    dish_id = Column(Integer, ForeignKey("dishes.id", ondelete="CASCADE"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dish = relationship("Dish", back_populates="recipe_mappings")
    ingredient = relationship("Ingredient", back_populates="recipe_mappings")
