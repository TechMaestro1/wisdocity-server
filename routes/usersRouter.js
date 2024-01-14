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
 *               role:
 *                 type: string  # Optional
 *     responses:
 *       200:
 *         description: User registration is successful. Returns token and userId.
 *       400:
 *         description: Incorrect email or password.
 *       409:
 *         description: A user with this email already exists.
 */
const Router = require("express");
const router = new Router();
const userController = require("../controlers/userController");
const authMiddleWare = require("../middleware/authMiddleware");

router.post("/registration", userController.registration);

/**
 * @swagger
 * /api/users/update:
 *   post:
 *     description: Update user information.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               country:
 *                 type: string
 *               avatar:
 *                 type: file
 *               role:
 *                 type: string
 *               id:
 *                 type: string
 *               category:
 *                 type: string
 *               bio:
 *                 type: string
 *               link_of_media:
 *                 type: string
 *               aditional_service:
 *                 type: string
 *               purpose:
 *                 type: string
 *               topics:
 *                 type: string
 *               way_for_learning:
 *                 type: string
 *               goals:
 *                 type: string
 *     responses:
 *       200:
 *         description: User information is updated. Returns updated user, learner, and expert data.
 *       401:
 *         description: User is not authenticated.
 *       404:
 *         description: Error updating user data or learner data or expert data.
 */
router.post("/update", authMiddleWare, userController.update);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     description: Log in a user.
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
 *         description: User login is successful. Returns token.
 *       400:
 *         description: User is not found or user password incorrect.
 */
router.post("/login", userController.login);
/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     description: Send a reset password link to the user's email.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password link sent successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/forgot-password", userController.forgotPassword);
/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     description: Reset user password after clicking on the reset link.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset is successful.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/reset-password", userController.resetPassword);

/**
 * @swagger
 * /api/users/auth:
 *   get:
 *     description: Check user authentication.
 *     middleware: authMiddleware
 *     security:
 *       - bearerAuth: []  # Use bearer authentication with the provided token
 *     responses:
 *       200:
 *         description: User is authenticated. Returns token, user data, and learner/expert data based on the user's role.
 *       401:
 *         description: User is not authenticated or token is invalid.
 */
router.get("/auth", authMiddleWare, userController.check);

module.exports = router;
