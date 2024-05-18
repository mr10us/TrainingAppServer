const Router = require("express");
const mediaController = require("../controllers/MediaController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.delete("/", checkRoleMiddleware("ADMIN"), mediaController.remove);

module.exports = router;