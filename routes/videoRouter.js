const Router = require("express");
const videoController = require("../controllers/VideoController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.delete("/", checkRoleMiddleware("ADMIN"), videoController.remove);

module.exports = router;