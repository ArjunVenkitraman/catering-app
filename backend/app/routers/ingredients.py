from fastapi import APIRouter
from app.controllers import ingredient as ctrl

router = APIRouter(prefix="/ingredients", tags=["Ingredients"])
router.get("")(ctrl.get_all_ingredients)
router.get("/{ingredient_id}")(ctrl.get_ingredient)
router.post("")(ctrl.create_ingredient)
router.put("/{ingredient_id}")(ctrl.update_ingredient)
router.delete("/{ingredient_id}")(ctrl.delete_ingredient)
