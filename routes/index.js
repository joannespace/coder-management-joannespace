const express = require("express");
const router = express.Router();

const userRouter = require("./user.api");
router.use("/user", userRouter);

const taskRouter = require("./task.api");
router.use("/task", taskRouter);

module.exports = router;
