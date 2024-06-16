const Router = require("express");
const accessController = require("../controllers/AccessController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const router = new Router();

router.post("/", accessController.grant);

module.exports = router;