/**
 * @swagger
 * /api/users:
 *   get:
 *     description: Отримати всіх користувачів
 *     responses:
 *       200:
 *         description: Успішна відповідь
 */

const Router = require("express");
const router = new Router();
const usersRouter = require("./usersRouter");

router.use("/users", usersRouter);
module.exports = router;
