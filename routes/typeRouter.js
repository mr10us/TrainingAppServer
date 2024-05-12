const Router = require("express");
const typeController = require("../controllers/TypeController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.get("/", typeController.getAll);
router.get("/:id", typeController.getOne);
router.post("/", checkRoleMiddleware, typeController.create);
router.put("/:id", checkRoleMiddleware, typeController.edit);

module.exports = router;