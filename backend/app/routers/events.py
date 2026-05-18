from fastapi import APIRouter
from app.controllers import event as ctrl
from app.controllers import grocery as grocery_ctrl

router = APIRouter(prefix="/events", tags=["Events"])
router.get("")(ctrl.get_all_events)
router.get("/{event_id}")(ctrl.get_event)
router.post("")(ctrl.create_event)
router.put("/{event_id}")(ctrl.update_event)
router.delete("/{event_id}")(ctrl.delete_event)
router.post("/{event_id}/generate-grocery-list")(grocery_ctrl.generate_grocery_list)
