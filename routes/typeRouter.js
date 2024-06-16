const Router = require("express");
const typeController = require("../controllers/TypeController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const checkPasswordMiddleware = require("../middleware/checkPasswordMiddleware");
const router = new Router();

router.get("/", checkPasswordMiddleware(), typeController.getAll);
router.get("/:id", checkPasswordMiddleware(), typeController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), typeController.create);
router.put("/:id", checkRoleMiddleware("ADMIN"), typeController.edit);
router.delete("/:id", checkRoleMiddleware("ADMIN"), typeController.remove);

module.exports = router;