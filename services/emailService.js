// utils/emailSender.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false, // true для 465, false для інших портів
  auth: {
    user: process.env.ZOHO_LOGIN, // Ваша повна адреса електронної пошти Zoho
    pass: process.env.ZOHO_PASS, // Ваш пароль для облікового запису Zoho
  },
});

const sendEmail = async (to, subject, body) => {
  try {
    const mailOptions = {
      from: "noreply@wisdocity.ai",
      to,
      subject,
      html: body,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
