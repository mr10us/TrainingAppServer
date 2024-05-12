const Router = require("express");
const categoryController = require("../controllers/CategoryController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getOne);
router.post("/", checkRoleMiddleware, categoryController.create);
router.put("/:id", checkRoleMiddleware, categoryController.edit);

module.exports = router;