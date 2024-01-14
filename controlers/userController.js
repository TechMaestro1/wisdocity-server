const ApiError = require("../error/AppiError");
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const AWS = require("aws-sdk");
const { sendEmail } = require("../services/emailService");

const S3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_S3,
  secretAccessKey: process.env.SECRET_ACCESS_S3,
});

const { User, Learner, Expert } = require("../models/models");

const generateJWT = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

const upload = multer({
  storage: multer.memoryStorage(),
});
class UserController {
  async registration(req, res, next) {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest("Incorrect email or password"));
    }

    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      return next(
        ApiError.userAlreadyAxist("A user with this email already exists")
      );
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({
      email,
      role,
      password: hashPassword,
    });

    const learner = await Learner.create({ user: user.id });
    const expert = await Expert.create({ user: user.id });
    const token = generateJWT(user.id, user.email, user.role);

    return res.json({ status: 200, token, userId: user.id });
  }
  async update(req, res, next) {
    const {
      full_name,
      country,
      role,
      id,
      category,
      bio,
      link_of_media,
      aditional_service,
      purpose,
      topics,
      way_for_learning,
      goals,
    } = req.body;
    const files = req.files;

    if (!id) {
      return next(ApiError.badRequest("Need id for update user"));
    }
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return next(ApiError.badRequest("User is not found"));
    }
    console.log(req.user);
    let afterUpdateExpert;
    let afterUpdateUser;
    let afterUpdateLearner;

    const img = files !== null && files !== undefined ? files.img : undefined;
    let avatarName = uuid.v4() + ".jpg";
    let fileUrl;
    try {
      if (!img) {
        console.log("user not add avatar");
      } else {
        console.log(req.files);
        const uploadParams = {
          Body: img.data,
          Bucket: process.env.BUCKET_NAME,
          Key: avatarName,
          ContentType: "image/jpeg",
          ACL: "public-read",
        };

        const uploadResult = await S3.upload(uploadParams).promise();
        console.log("File uploaded to S3:", uploadResult);
        fileUrl = uploadResult.Location;
      }
    } catch (e) {
      console.error("Error uploading file to S3:", e);
      return res.json({ status: 500, error: "Internal Server Error" });
    }

    try {
      const userUpdateObject = {};
      if (full_name) userUpdateObject.full_name = full_name;
      if (country) userUpdateObject.country = country;
      if (role) userUpdateObject.role = role;
      if (fileUrl) userUpdateObject.avatar = fileUrl;
      if (Object.keys(userUpdateObject).length > 0) {
        const [rowsUpdatedUser, [userAfterUpdate]] = await User.update(
          userUpdateObject,
          { returning: true, where: { id } }
        );
        afterUpdateUser = userAfterUpdate.dataValues;
        console.log("User updated:", userAfterUpdate);
      }
    } catch (e) {
      console.log(e);
      res.json({ status: 404, error: "Error updating user data" });
    }

    try {
      if (user.role === "LEARNER") {
        const learnerUpdateObject = {};
        if (purpose) learnerUpdateObject.purpose = purpose;
        if (topics) learnerUpdateObject.topics = topics;
        if (way_for_learning)
          learnerUpdateObject.way_for_learning = way_for_learning;
        if (goals) learnerUpdateObject.goals = goals;
        if (Object.keys(learnerUpdateObject).length > 0) {
          const [rowsUpdatedLearner, [learnerAfterUpdate]] =
            await Learner.update(learnerUpdateObject, {
              returning: true,
              where: { id },
            });
          afterUpdateLearner = learnerAfterUpdate;
          console.log("Learner updated:", learnerAfterUpdate);
        }
      }
    } catch (e) {
      console.log(e);
      res.json({ status: 404, error: "Error updating learner data" });
    }

    try {
      if (user.role === "EXPERT") {
        const expertUpdateObject = {};
        if (category) expertUpdateObject.category = category;
        if (bio) expertUpdateObject.bio = bio;
        if (link_of_media) expertUpdateObject.link_of_media = link_of_media;
        if (aditional_service)
          expertUpdateObject.aditional_service = aditional_service;
        if (Object.keys(expertUpdateObject).length > 0) {
          const [rowsUpdatedExpert, [expertAfterUpdate]] = await Expert.update(
            expertUpdateObject,
            { returning: true, where: { id } }
          );
          afterUpdateExpert = expertAfterUpdate;
          console.log("expert updated:", expertAfterUpdate);
        }
      }
    } catch (e) {
      console.log(e);
      res.json({ status: 404, error: "Error updating expert data" });
    }
    const userWithoutPassword = { ...afterUpdateUser, password: undefined };
    return res.json({
      status: 200,
      user: userWithoutPassword,
      learner: afterUpdateLearner,
      expert: afterUpdateExpert,
    });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    console.log(email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.badRequest("User is not found"));
    }
    let comparePasswordd = bcrypt.compareSync(password, user.password);
    if (!comparePasswordd) {
      return next(ApiError.badRequest("User password incorect"));
    }
    const token = generateJWT(user.id, user.email, user.role);
    return res.json({ token });
  }
  async forgotPassword(req, res, next) {
    const { email } = req.body;

    try {
      // Перевірка, чи існує користувач з таким email в базі даних
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return next(ApiError.badRequest("User is not found"));
      }

      // Генерація токену
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Відправлення листа з токеном

      await sendEmail(
        email,
        "Password Reset",
        `<p>Click <a href="http://localhost:5000/api-docs/${token}">here</a> to reset your password.</p>`
      );
      console.log("Email sent successfully");

      res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async resetPassword(req, res, next) {
    const { token, newPassword } = req.body;

    try {
      // Розкодування токену
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

      // Захешування нового пароля
      const hashedPassword = await bcrypt.hash(newPassword, 5);

      // Зміна пароля в базі даних
      const updatedUser = await User.update(
        { password: hashedPassword },
        { returning: true, where: { id: decodedToken.id } }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async check(req, res, next) {
    const { id, email, role } = req.user;
    console.log(req);

    const token = generateJWT(id, email, role);
    let user;
    let userWithoutPassword;

    switch (role) {
      case "LEARNER":
        user = await User.findOne({ where: { email } });
        userWithoutPassword = { ...user.dataValues, password: undefined };
        const learner = await Learner.findOne({ where: { id } });
        try {
          await sendEmail(
            "yuriiyarmola1@gmail.com",
            "Subject",
            '<p>hello it message from zoho <a href="http://localhost:5000/api-docs">autentificate your profile</a></p>'
          );
          console.log("Email sent successfully");
        } catch (error) {
          console.error("Error sending email:", error);
        }

        return res.json({ token, user: userWithoutPassword, learner });
      case "EXPERT":
        user = await User.findOne({ where: { email } });
        userWithoutPassword = { ...user.dataValues, password: undefined };
        const expert = await Expert.findOne({ where: { id } });
        return res.json({ token, user: userWithoutPassword, expert });
    }
  }
}

module.exports = new UserController();
