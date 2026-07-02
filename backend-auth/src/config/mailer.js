const nodemailer = require('nodemailer');
require('dotenv').config();

const hasEmailCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasEmailCredentials
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 1000
    })
  : null;

const sendMailSafely = async (mailOptions, fallbackLabel) => {
  if (!transporter) {
    console.warn(`[mailer] ${fallbackLabel} skipped: EMAIL_USER/EMAIL_PASS are not configured.`);
    return false;
  }

  try {
    console.log(`[mailer] Sending ${fallbackLabel} to ${mailOptions.to}`);

    const info = await transporter.sendMail(mailOptions);

    console.log("[mailer] Email sent successfully!");
    console.log(info);

    return true;
  } catch (error) {
    console.error("[mailer] Failed to send email");
    console.error(error);

    return false;
  }
};

const sendOTP = async (toEmail, otpCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Authentication OTP Code',
    text: `Your verification code is: ${otpCode}. It will expire in 10 minutes.`,
    html: `<h3>Your verification code is: <strong>${otpCode}</strong></h3><p>It will expire in 10 minutes.</p>`,
  };

  return sendMailSafely(mailOptions, 'OTP email');
};

const sendPasswordResetEmail = async (toEmail, resetCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Password Reset Request',
    text: `Your password reset code is: ${resetCode}. It expires in 15 minutes.`,
    html: `<h3>Password Reset Code: <strong>${resetCode}</strong></h3><p>If you did not request this, please ignore this email. This code expires in 15 minutes.</p>`,
  };

  return sendMailSafely(mailOptions, 'password reset email');
};

module.exports = { sendOTP, sendPasswordResetEmail };