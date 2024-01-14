const Router = require("express");
const router = new Router();
const usersRouter = require("./usersRouter");

router.use("/users", usersRouter);
module.exports = router;
