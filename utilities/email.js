const nodemailer = require("nodemailer");

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD } = process.env;

const sendEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Explora Inc",
    to: user.email,
    text: user.message,
    subject: user.subject,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
