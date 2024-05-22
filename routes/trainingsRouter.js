const Router = require("express");
const TrainingsController = require("../controllers/TrainingsController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.get("/", TrainingsController.getAll);
router.get("/:id", TrainingsController.getOne);
router.post("/review", TrainingsController.addReview);
router.post("/", checkRoleMiddleware("ADMIN"), TrainingsController.create);
router.patch("/:id", checkRoleMiddleware("ADMIN"), TrainingsController.edit);
router.delete("/:id", checkRoleMiddleware("ADMIN"), TrainingsController.remove);

module.exports = router;
