/**
 * @swagger
 * /api/users/registration:
 *   post:
 *     description: Register a user with email and password.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registration is successful.
 *       404:
 *         description: Incorrect email or password.
 *       409:
 *         description: A user with this email already exists.
 */
const Router = require("express");
const router = new Router();
const userController = require("../controlers/userController");
const authMiddleWare = require("../middleware/authMiddleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.get("/auth", authMiddleWare, userController.check);
router.post("/update", authMiddleWare, userController.update);

module.exports = router;
