const Router = require("express");
const userRouter = require("./userRouter");
const trainingsRouter = require("./trainingsRouter");
const typeRouter = require("../routes/typeRouter");
const categoryRouter = require("../routes/categoryRouter");

const router = new Router();

router.use("/user", userRouter);
router.use("/training", trainingsRouter);
router.use("/type", typeRouter);
router.use("/category", categoryRouter);

module.exports = router;
