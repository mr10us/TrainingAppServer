const Router = require("express");
const userRouter = require("./userRouter");
const trainingsRouter = require("./trainingsRouter");
const exerciseRouter = require("./exerciseRouter");
const typeRouter = require("../routes/typeRouter");
const categoryRouter = require("../routes/categoryRouter");
const mediaRouter = require("./mediaRouter");

const router = new Router();

router.use("/user", userRouter);
router.use("/training", trainingsRouter);
router.use("/exercise", exerciseRouter);
router.use("/type", typeRouter);
router.use("/category", categoryRouter);
router.use("/media", mediaRouter)

module.exports = router;
