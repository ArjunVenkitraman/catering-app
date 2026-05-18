from fastapi import APIRouter
from app.controllers import recipe as ctrl

router = APIRouter(tags=["Recipes"])
router.get("/dishes/{dish_id}/recipes")(ctrl.get_dish_recipes)
router.post("/recipes")(ctrl.create_recipe_mapping)
router.put("/recipes/{mapping_id}")(ctrl.update_recipe_mapping)
router.delete("/recipes/{mapping_id}")(ctrl.delete_recipe_mapping)
