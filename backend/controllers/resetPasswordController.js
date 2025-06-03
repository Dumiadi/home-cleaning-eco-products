const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 🔐 Generează un token random
const generateToken = () => crypto.randomBytes(32).toString('hex');

// ✉️ Trimite email cu link de reset
const sendResetEmail = async (email, token) => {
  const resetUrl = `http://localhost:3000/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'emailul.tau@gmail.com',
      pass: 'parola-app-google',
    },
  });

  await transporter.sendMail({
    from: '"Home Cleaning" <no-reply@homecleaning.ro>',
    to: email,
    subject: 'Resetare parolă',
    html: `<p>Apasă <a href="${resetUrl}">aici</a> pentru a reseta parola.</p>`,
  });
};

// 👉 Pas 1 – cere resetare
const requestReset = (req, res) => {
  const { email } = req.body;
  const token = generateToken();
  const expires = new Date(Date.now() + 3600000); // 1 oră

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ message: 'Email inexistent' });

    const userId = results[0].id;

    db.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expires],
      async (err) => {
        if (err) return res.status(500).json({ message: 'Eroare DB' });
        await sendResetEmail(email, token);
        res.json({ message: 'Email trimis cu succes' });
      }
    );
  });
};

// 👉 Pas 2 – trimite parolă nouă
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  db.query(
    'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
    [token],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(400).json({ message: 'Token invalid sau expirat' });

      const userId = results[0].user_id;
      const hashed = await bcrypt.hash(newPassword, 10);

      db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
      db.query('DELETE FROM password_resets WHERE user_id = ?', [userId]);
      res.json({ message: 'Parola a fost resetată cu succes' });
    }
  );
};

module.exports = { requestReset, resetPassword };
