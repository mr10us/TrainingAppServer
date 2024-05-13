const Router = require("express");
const typeController = require("../controllers/TypeController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.get("/", typeController.getAll);
router.get("/:id", typeController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), typeController.create);
router.put("/:id", checkRoleMiddleware("ADMIN"), typeController.edit);
router.delete("/:id", checkRoleMiddleware("ADMIN"), typeController.remove);

module.exports = router;