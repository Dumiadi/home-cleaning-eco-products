const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ✅ Generează token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
};

// 🧾 Înregistrare
const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (results?.length > 0) {
      return res.status(400).json({ message: 'Emailul este deja folosit' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Eroare la înregistrare' });
        const user = { id: result.insertId, name, email, role: 'user' };
        const token = generateToken(user.id, 'user');
        res.status(201).json({ user, token });
      }
    );
  });
};

// 🔐 Login
const loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'Utilizator inexistent' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Parolă incorectă' });

    // 1. Generează cod
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minute

    db.query(
      'UPDATE users SET two_factor_code = ?, two_factor_expiry = ? WHERE id = ?',
      [code, expiry, user.id]
    );

    // 2. Trimite email
    await sendEmail(email, 'Cod 2FA Login', `Codul tău este: ${code}`);

    res.json({ message: 'Cod trimis pe email', userId: user.id });
  });
};

// 👤 Profil
const getProfile = (req, res) => {
  res.json(req.user);
};

// 📦 Comenzi produse
const getUserOrders = (req, res) => {
  db.query('SELECT * FROM orders WHERE user_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Eroare la comenzi' });
    res.json(results);
  });
};

// 🧼 Programări servicii
const getUserServiceOrders = (req, res) => {
  const sql = `
    SELECT so.*, s.name AS service_name
    FROM service_orders so
    JOIN services s ON s.id = so.service_id
    WHERE so.user_id = ?
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Eroare la programări' });
    res.json(results);
  });
};

// ➕ Creează programare
const bookService = (req, res) => {
  const { service_id, date, time, address, note } = req.body;

  const sql = `
    INSERT INTO service_orders (user_id, service_id, date, time, address, note, status)
    VALUES (?, ?, ?, ?, ?, ?, 'in asteptare')
  `;
  db.query(sql, [req.user.id, service_id, date, time, address, note], (err) => {
    if (err) return res.status(500).json({ message: 'Eroare DB' });
    res.json({ message: 'Programare adăugată' });
  });
};

// ✏️ Modifică programare
const updateBooking = (req, res) => {
  const { id } = req.params;
  const { time, address } = req.body;

  const sql = 'UPDATE service_orders SET time = ?, address = ? WHERE id = ? AND user_id = ?';
  db.query(sql, [time, address, id, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'Eroare la update' });
    res.json({ message: 'Modificat cu succes' });
  });
};

// 🗑️ Anulează programare + notificare
const cancelBooking = (req, res) => {
  const { id } = req.params;

  const sqlSelect = `
    SELECT so.*, u.email, u.name, s.name AS service_name
    FROM service_orders so
    JOIN users u ON so.user_id = u.id
    JOIN services s ON s.id = so.service_id
    WHERE so.id = ? AND so.user_id = ?
  `;

  db.query(sqlSelect, [id, req.user.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Programare inexistentă' });

    const booking = results[0];

    db.query('UPDATE service_orders SET status = "anulat" WHERE id = ? AND user_id = ?', [id, req.user.id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Eroare la anulare' });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: booking.email,
        subject: `Programare anulată – Curățenie Eco`,
        html: `
          <h3>Salut, ${booking.name}</h3>
          <p>Ai anulat programarea pentru:</p>
          <ul>
            <li><strong>Serviciu:</strong> ${booking.service_name}</li>
            <li><strong>Data:</strong> ${booking.date}</li>
            <li><strong>Ora:</strong> ${booking.time}</li>
            <li><strong>Adresă:</strong> ${booking.address}</li>
          </ul>
        `
      };

      transporter.sendMail(mailOptions);
      res.json({ message: 'Programare anulată cu succes.' });
    });
  });
};

// 📅 Date indisponibile
const getUnavailableDates = (req, res) => {
  db.query('SELECT DISTINCT date FROM service_orders WHERE status != "anulat"', (err, result) => {
    if (err) return res.status(500).json({ message: 'Eroare DB' });
    res.json(result.map(r => r.date));
  });
};

// 🧾 Toate serviciile
const getAllServices = (req, res) => {
  db.query('SELECT * FROM services ORDER BY id DESC', (err, result) => {
    if (err) return res.status(500).json({ message: 'Eroare la servicii' });
    res.json(result);
  });
};

// 🔁 Update profil (cu avatar)
const updateUser = (req, res) => {
  const userId = req.user.id;
  const { name, email, password, avatar } = req.body;

  let sql = 'UPDATE users SET name = ?, email = ?';
  let params = [name, email];

  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    sql += ', password = ?';
    params.push(hashedPassword);
  }

  if (avatar) {
    sql += ', avatar = ?';
    params.push(avatar);
  }

  sql += ' WHERE id = ?';
  params.push(userId);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ message: 'Eroare la actualizare' });

    db.query('SELECT id, name, email, avatar FROM users WHERE id = ?', [userId], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Actualizare parțială' });
      res.json({ message: 'Date actualizate', user: rows[0] });
    });
  });
};

// ❌ Ștergere cont
const deleteUser = (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'Eroare la ștergere cont' });
    res.json({ message: 'Cont șters' });
  });
};

// 🔎 Toți userii (admin)
const getAllUsers = (req, res) => {
  db.query('SELECT * FROM users ORDER BY created_at DESC', (err, result) => {
    if (err) return res.status(500).json({ error: 'Eroare DB' });
    res.json(result);
  });
};

// 📧 Contact / suport
const sendSupportMessage = (req, res) => {
  const { subject, message, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.SMTP_USER,
    subject: `[SUPORT] ${subject}`,
    html: `<p><strong>De la:</strong> ${email}</p><p>${message}</p>`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) return res.status(500).json({ message: 'Eroare la trimiterea emailului' });
    res.json({ message: 'Email trimis' });
  });
};

// 🔐 Cerere resetare parolă
const forgotPassword = (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expire = new Date(Date.now() + 3600000); // 1 oră

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'Email invalid' });

    db.query('UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?', [token, expire, email], (err2) => {
      if (err2) return res.status(500).json({ message: 'Eroare DB' });

      const resetURL = `http://localhost:3000/resetare-parola/${token}`;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: 'support@curatenie.ro',
        to: email,
        subject: 'Resetare parolă',
        html: `<p>Apasă pe link pentru resetare:</p><a href="${resetURL}">${resetURL}</a>`
      };

      transporter.sendMail(mailOptions, (err3) => {
        if (err3) return res.status(500).json({ message: 'Emailul nu s-a trimis' });
        res.json({ message: 'Email trimis cu succes' });
      });
    });
  });
};

// 🔄 Execută resetare
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(`
    UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL
    WHERE reset_token = ? AND reset_token_expire > NOW()
  `, [hashedPassword, token], (err, result) => {
    if (err) return res.status(500).json({ message: 'Eroare DB' });
    if (result.affectedRows === 0)
      return res.status(400).json({ message: 'Token invalid sau expirat' });

    res.json({ message: 'Parolă resetată cu succes' });
  });
};

// ✅ Export
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getUserOrders,
  getUserServiceOrders,
  updateUser,
  deleteUser,
  getAllUsers,
  bookService,
  getUnavailableDates,
  getAllServices,
  updateBooking,
  cancelBooking,
  forgotPassword,
  resetPassword,
  sendSupportMessage
};
