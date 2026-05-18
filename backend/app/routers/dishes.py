from fastapi import APIRouter
from app.controllers import dish as ctrl

router = APIRouter(prefix="/dishes", tags=["Dishes"])
router.get("")(ctrl.get_all_dishes)
router.get("/{dish_id}")(ctrl.get_dish)
router.post("")(ctrl.create_dish)
router.put("/{dish_id}")(ctrl.update_dish)
router.delete("/{dish_id}")(ctrl.delete_dish)
