const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const send2FACode = (email, code) => {
  return transporter.sendMail({
    from: '"Platformă Curățenie" <no-reply@curatenie.ro>',
    to: email,
    subject: 'Codul tău de autentificare 2FA',
    text: `Codul tău este: ${code}. Este valabil 5 minute.`,
  });
};

module.exports = { send2FACode };
