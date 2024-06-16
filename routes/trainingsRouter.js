const Router = require("express");
const TrainingsController = require("../controllers/TrainingsController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const checkPasswordMiddleware = require("../middleware/checkPasswordMiddleware");
const router = new Router();

router.get("/", checkPasswordMiddleware(), TrainingsController.getAll);
router.get("/:id", checkPasswordMiddleware(), TrainingsController.getOne);
router.post("/review", checkPasswordMiddleware(), TrainingsController.addReview);
router.post("/", checkRoleMiddleware("ADMIN"), TrainingsController.create);
router.patch("/:id", checkRoleMiddleware("ADMIN"), TrainingsController.edit);
router.delete("/:id", checkRoleMiddleware("ADMIN"), TrainingsController.remove);

module.exports = router;
