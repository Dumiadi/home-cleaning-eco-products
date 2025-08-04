// backend/utils/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderEmail(to, subject, htmlContent) {
  const mailOptions = {
    from: `"Echipa Curățenie" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email trimis către', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Eroare email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = sendOrderEmail;
