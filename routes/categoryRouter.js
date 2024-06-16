const Router = require("express");
const categoryController = require("../controllers/CategoryController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const checkPasswordMiddleware = require("../middleware/checkPasswordMiddleware");
const router = new Router();

router.get("/", checkPasswordMiddleware(), categoryController.getAll);
router.get("/:id", checkPasswordMiddleware(), categoryController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), categoryController.create);
router.put("/:id", checkRoleMiddleware("ADMIN"), categoryController.edit);
router.delete("/:id", checkRoleMiddleware("ADMIN"), categoryController.remove);

module.exports = router;