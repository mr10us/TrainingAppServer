const Router = require("express");
const TrainingsController = require("../controllers/TrainingsController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.get("/", TrainingsController.getAll);
router.get("/:id", TrainingsController.getOne);
router.post("/", checkRoleMiddleware, TrainingsController.create);
router.patch("/:id", checkRoleMiddleware, TrainingsController.edit);

module.exports = router;
