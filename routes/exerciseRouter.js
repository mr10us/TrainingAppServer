const Router = require("express");
const exerciseController = require("../controllers/ExerciseController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const checkPasswordMiddleware = require("../middleware/checkPasswordMiddleware");
const router = new Router();

router.get("/", checkPasswordMiddleware(), exerciseController.getAll);
router.get("/:id", checkPasswordMiddleware(), exerciseController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), exerciseController.create);
router.patch("/:id", checkRoleMiddleware("ADMIN"), exerciseController.edit);
router.delete("/:id", checkRoleMiddleware("ADMIN"), exerciseController.remove);

module.exports = router;