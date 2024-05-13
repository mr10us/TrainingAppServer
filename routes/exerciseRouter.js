const Router = require("express");
const exerciseController = require("../controllers/ExerciseController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.get("/", exerciseController.getAll);
router.get("/:id", exerciseController.getOne);
router.post("/", checkRoleMiddleware, exerciseController.create);
router.put("/:id", checkRoleMiddleware, exerciseController.edit);
router.delete("/:id", checkRoleMiddleware, exerciseController.remove);

module.exports = router;