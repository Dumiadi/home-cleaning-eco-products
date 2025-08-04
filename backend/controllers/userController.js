const pool = require('../config/db'); // ✅ Folosim pool-ul cu promisiuni
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ✅ Generează token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
};

// 🧾 Înregistrare
const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      confirmPassword,
      agreeToTerms,
      newsletterSubscribe,
      ecoPreferences 
    } = req.body;

    // ✅ Validări server-side
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Toate câmpurile obligatorii trebuie completate' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parolele nu coincid' 
      });
    }

    if (!agreeToTerms) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trebuie să accepți Termenii și Condițiile' 
      });
    }

    // ✅ Verifică dacă emailul există deja
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Există deja un cont cu această adresă de email' 
      });
    }

    // ✅ Hash parola
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // ✅ Crează utilizatorul
    const [result] = await pool.query(`
      INSERT INTO users (
        name, email, password, phone, newsletter_subscribe, 
        eco_preferences, agree_to_terms, created_at, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'user', 'active')
    `, [
      `${firstName} ${lastName}`,
      email.toLowerCase().trim(),
      hashedPassword,
      phone || null,
      newsletterSubscribe || false,
      JSON.stringify(ecoPreferences || {}),
      agreeToTerms
    ]);

    // ✅ Returnează utilizatorul și token-ul
    const user = { 
      id: result.insertId, 
      name: `${firstName} ${lastName}`, 
      email: email.toLowerCase().trim(), 
      role: 'user' 
    };
    
    const token = generateToken(user.id, 'user');
    
    res.status(201).json({ 
      success: true,
      user, 
      token,
      message: 'Cont creat cu succes!' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la crearea contului' 
    });
  }
};
// În userController.js, găsește funcția loginUser și schimbă linia:
// PASUL 2: Înlocuiește funcția loginUser în userController.js cu această versiune simplificată

const loginUser = async (req, res) => {
  try {
    console.log('🔐 LOGIN ATTEMPT pentru:', req.body.email);
    
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email și parola sunt obligatorii' 
      });
    }

    // ✅ Căută utilizatorul în baza de date
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    
    console.log('👤 Căutare utilizator pentru:', email);
    console.log('📊 Rezultate găsite:', results.length);
    
    if (results.length === 0) {
      console.log('❌ Utilizator nu există');
      return res.status(401).json({ 
        success: false, 
        message: 'Email sau parolă incorectă' 
      });
    }

    const user = results[0];
    console.log('👤 Utilizator găsit:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      password_from_db: user.password
    });

    // ✅ VERIFICARE PAROLĂ SIMPLIFICATĂ (TEMPORAR)
    console.log('🔑 Parolă din formular:', password);
    console.log('🔑 Parolă din DB:', user.password);
    
    // Pentru debugging, verificăm ambele variante
    let isMatch = false;
    
    // Variant 1: Parolă în text clar
    if (password === user.password) {
      isMatch = true;
      console.log('✅ Parolă match - text clar');
    }
    // Variant 2: Verifică și cu bcrypt pentru cazul în care este hash-uită
    else {
      try {
        isMatch = await bcrypt.compare(password, user.password);
        console.log('✅ Parolă match - bcrypt:', isMatch);
      } catch (bcryptError) {
        console.log('❌ Eroare bcrypt:', bcryptError.message);
        isMatch = false;
      }
    }
    
    if (!isMatch) {
      console.log('❌ Parolă incorectă');
      return res.status(401).json({ 
        success: false, 
        message: 'Email sau parolă incorectă' 
      });
    }

    // ✅ Verifică dacă contul este activ
    if (user.status && user.status === 'inactive') {
      console.log('❌ Cont inactiv');
      return res.status(403).json({
        success: false,
        message: 'Contul nu este activat.'
      });
    }

    // ✅ SKIP 2FA pentru debugging - LOGIN DIRECT
    console.log('🎯 Login direct fără 2FA');
    
    const token = generateToken(user.id, user.role || 'user');
    console.log('🔑 Token generat pentru utilizatorul:', user.id, 'cu rolul:', user.role);
    
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || null
    };

    console.log('✅ LOGIN REUȘIT pentru:', userResponse);

    return res.json({
      success: true,
      user: userResponse,
      token: token,
      message: 'Autentificare reușită'
    });

  } catch (error) {
    console.error('💥 EROARE LOGIN:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la autentificare: ' + error.message 
    });
  }
};
// 👤 Profil
const getProfile = (req, res) => {
  res.json(req.user);
};

// 📦 Comenzi produse
const getUserOrders = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM orders WHERE user_id = ?', [req.user.id]);
    res.json(results);
  } catch (err) {
    console.error('Eroare comenzi:', err);
    res.status(500).json({ message: 'Eroare la încărcarea comenzilor' });
  }
};

// 🧼 Programări servicii
const getUserServiceOrders = async (req, res) => {
  try {
    const sql = `
      SELECT so.*, s.name AS service_name
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.user_id = ?
      ORDER BY so.created_at DESC
    `;
    const [results] = await pool.query(sql, [req.user.id]);
    res.json(results);
  } catch (err) {
    console.error('Eroare programări:', err);
    res.status(500).json({ message: 'Eroare la încărcarea programărilor' });
  }
};

// ➕ Creează programare
const bookService = async (req, res) => {
  try {
    const { service_id, date, time, address, note } = req.body;

    const sql = `
      INSERT INTO service_orders (user_id, service_id, date, time, address, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'in asteptare', NOW())
    `;
    
    await pool.query(sql, [req.user.id, service_id, date, time, address, note]);
    res.json({ message: 'Programare adăugată cu succes' });
  } catch (err) {
    console.error('Eroare rezervare:', err);
    res.status(500).json({ message: 'Eroare la crearea rezervării' });
  }
};

// ✏️ Modifică programare
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { time, address } = req.body;

    const sql = 'UPDATE service_orders SET time = ?, address = ?, updated_at = NOW() WHERE id = ? AND user_id = ?';
    await pool.query(sql, [time, address, id, req.user.id]);
    
    res.json({ message: 'Programare modificată cu succes' });
  } catch (err) {
    console.error('Eroare update:', err);
    res.status(500).json({ message: 'Eroare la modificarea programării' });
  }
};

// 🗑️ Anulează programare + notificare
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const sqlSelect = `
      SELECT so.*, u.email, u.name, s.name AS service_name
      FROM service_orders so
      JOIN users u ON so.user_id = u.id
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.id = ? AND so.user_id = ?
    `;

    const [results] = await pool.query(sqlSelect, [id, req.user.id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Programare inexistentă' });
    }

    const booking = results[0];

    await pool.query(
      'UPDATE service_orders SET status = "anulat", updated_at = NOW() WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );

    // Trimite email de confirmare anulare
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
          <li><strong>Serviciu:</strong> ${booking.service_name || 'Serviciu necunoscut'}</li>
          <li><strong>Data:</strong> ${booking.date}</li>
          <li><strong>Ora:</strong> ${booking.time}</li>
          <li><strong>Adresă:</strong> ${booking.address}</li>
        </ul>
      `
    };

    transporter.sendMail(mailOptions);
    res.json({ message: 'Programare anulată cu succes.' });
  } catch (err) {
    console.error('Eroare anulare:', err);
    res.status(500).json({ message: 'Eroare la anularea programării' });
  }
};

// 📅 Date indisponibile
const getUnavailableDates = async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT DISTINCT date FROM service_orders WHERE status != "anulat"'
    );
    res.json(results.map(r => r.date));
  } catch (err) {
    console.error('Eroare date indisponibile:', err);
    res.status(500).json({ message: 'Eroare la încărcarea datelor indisponibile' });
  }
};

// ✅ Toate serviciile (DEPRECATED - folosește /api/services)
const getAllServices = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('Eroare la servicii:', err);
    res.status(500).json({ message: 'Eroare la încărcarea serviciilor' });
  }
};

// Salvare comandă nouă - pentru produse
const saveOrder = async (req, res) => {
  try {
    const { user, items, total, date } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO orders (user_name, user_email, user_phone, user_address, items, total, order_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [user.name, user.email, user.phone, user.address, JSON.stringify(items), total, date]
    );
    
    res.json({ 
      message: 'Comandă salvată cu succes!', 
      orderId: result.insertId 
    });
  } catch (err) {
    console.error('Eroare salvare comandă:', err);
    res.status(500).json({ error: 'Eroare la salvarea comenzii' });
  }
};

// Endpoint pentru trimitere email
const sendEmail = async (req, res) => {
  try {
    const { name, email, address, phone, items, total } = req.body;
    
    console.log('Email de confirmare pentru:', email);
    console.log('Comandă:', { name, address, phone, items, total });
    
    res.json({ message: 'Email trimis cu succes!' });
  } catch (err) {
    console.error('Eroare trimitere email:', err);
    res.status(500).json({ error: 'Eroare la trimiterea email-ului' });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, avatar } = req.body;

    let sql = 'UPDATE users SET name = ?, email = ?, updated_at = NOW()';
    const params = [name, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ', password = ?';
      params.push(hashedPassword);
    }

    if (avatar) {
      sql += ', avatar = ?';
      params.push(avatar); // Cloudinary URL
    }

    sql += ' WHERE id = ?';
    params.push(userId);

    await pool.query(sql, params);

    const [rows] = await pool.query(
      'SELECT id, name, email, avatar, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Date actualizate cu succes', user: rows[0] });
  } catch (err) {
    console.error('Eroare actualizare user:', err);
    res.status(500).json({ message: 'Eroare la actualizarea datelor' });
  }
};


// ❌ Ștergere cont
const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Cont șters cu succes' });
  } catch (err) {
    console.error('Eroare ștergere cont:', err);
    res.status(500).json({ message: 'Eroare la ștergerea contului' });
  }
};

// 🔎 Toți userii (admin)
const getAllUsers = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error('Eroare încărcare utilizatori:', err);
    res.status(500).json({ error: 'Eroare la încărcarea utilizatorilor' });
  }
};
const sendSupportMessage = async (req, res) => {
  try {
    console.log('📨 Primire mesaj suport');
    console.log('🔍 Request body:', req.body);
    console.log('👤 Utilizator:', req.user);  // Debug user

    // Verificare suplimentară
    if (!req.user || !req.user.id) {
      // Încearcă să preiei datele din token sau body
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
          
          // Caută utilizatorul în baza de date
          const [userResults] = await pool.query(
            'SELECT id, name, email FROM users WHERE id = ?', 
            [decoded.id]
          );

          if (userResults.length > 0) {
            req.user = userResults[0];
          }
        } catch (tokenError) {
          console.error('❌ Eroare verificare token:', tokenError);
        }
      }

      // Dacă tot nu avem user
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false,
          message: 'Trebuie să fii autentificat pentru a trimite un mesaj de suport' 
        });
      }
    }

    const { subject, message } = req.body;

    // Validări
    if (!subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Subiectul și mesajul sunt obligatorii' 
      });
    }

    // Inserează mesajul în baza de date
    const [result] = await pool.query(
      `INSERT INTO support_messages 
      (user_id, name, email, subject, message, created_at, status) 
      VALUES (?, ?, ?, ?, ?, NOW(), 'pending')`, 
      [
        req.user.id, 
        req.user.name || req.body.name || 'Utilizator', 
        req.user.email || req.body.email, 
        subject, 
        message
      ]
    );

    // Trimite notificare internă
    await sendInternalNotification(req.user, {
      subject, 
      message,
      supportMessageId: result.insertId
    });

    res.status(201).json({
      success: true,
      message: 'Mesaj de suport trimis cu succes',
      supportMessageId: result.insertId
    });
  } catch (error) {
    console.error('❌ Eroare trimitere suport:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la trimiterea mesajului de suport',
      error: error.message
    });
  }
};


// 📧 Funcție notificare internă îmbunătățită
const sendInternalNotification = async (user, details) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'contact@curatenie-eco.ro',
      subject: `Mesaj Suport Nou: ${details.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>📨 Mesaj Nou de Suport</h2>
          <p><strong>ID Mesaj:</strong> #${details.supportMessageId}</p>
          <p><strong>De la:</strong> ${user.name} (${user.email})</p>
          <p><strong>Subiect:</strong> ${details.subject}</p>
          <p><strong>Categorie:</strong> ${details.category || 'Necategorizat'}</p>
          <p><strong>Mesaj:</strong></p>
          <blockquote>${details.message}</blockquote>
        </div>
      `
    });

  } catch (error) {
    console.error('❌ Eroare trimitere notificare:', error);
  }
};
const sendAdminNotification = async (messageDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'contact@curatenie-eco.ro',  // Email admin
      subject: `Mesaj Nou Suport: ${messageDetails.subject}`,
      html: `
        <div>
          <h2>📨 Mesaj Nou de Suport</h2>
          <p><strong>De la:</strong> ${messageDetails.name} (${messageDetails.email})</p>
          <p><strong>Subiect:</strong> ${messageDetails.subject}</p>
          <p><strong>Mesaj:</strong> ${messageDetails.message}</p>
        </div>
      `
    });

  } catch (error) {
    console.error('Eroare trimitere notificare admin:', error);
  }
};

// Helper pentru trimitere email
const sendEmailHelper = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured, skipping email');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Curățenie Eco" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// 🔐 Cerere resetare parolă
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 3600000); // 1 oră

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Email invalid' });
    }

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?', 
      [token, expire, email]
    );

    const resetURL = `http://localhost:3000/resetare-parola/${token}`;
    await sendEmailHelper(email, 'Resetare parolă', `Apasă pe link pentru resetare: ${resetURL}`);

    res.json({ message: 'Email de resetare trimis cu succes' });
  } catch (err) {
    console.error('Eroare resetare parolă:', err);
    res.status(500).json({ message: 'Eroare la trimiterea email-ului de resetare' });
  }
};

// 🔄 Execută resetare
// controllers/userController.js
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'Parolă lipsă' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.query(`
      UPDATE users 
      SET password = ?, reset_token = NULL, reset_token_expire = NULL 
      WHERE reset_token = ? AND reset_token_expire > NOW()
    `, [hashedPassword, token]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Token invalid sau expirat' });
    }

    res.json({ message: 'Parolă resetată cu succes' });
  } catch (err) {
    console.error('Eroare execuție resetare:', err);
    res.status(500).json({ message: 'Eroare la resetarea parolei' });
  }
};


// 🟡 Generează și trimite codul pe email
const send2FACode = async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Email invalid' });
    }

    await pool.query(
      'UPDATE users SET two_factor_code = ?, two_factor_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE email = ?',
      [code, email]
    );

    await sendEmailHelper(email, 'Codul tău de autentificare', `
      <h3>Cod de autentificare</h3>
      <p>Codul tău de verificare este: <strong>${code}</strong></p>
      <p>Codul expiră în 10 minute.</p>
    `);

    res.json({ message: 'Cod trimis cu succes' });
  } catch (err) {
    console.error('Eroare trimitere cod 2FA:', err);
    res.status(500).json({ message: 'Eroare la trimiterea codului' });
  }
};

const verify2FACode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Utilizator inexistent' });
    }

    const user = users[0];

    if (
      !user.two_factor_code ||
      user.two_factor_code !== code ||
      new Date(user.two_factor_expiry) < new Date()
    ) {
      return res.status(401).json({ message: 'Cod invalid sau expirat' });
    }

    // Curăță codul după verificare
    await pool.query(
      'UPDATE users SET two_factor_code = NULL, two_factor_expiry = NULL WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user.id, user.role);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Eroare verificare cod 2FA:', err);
    res.status(500).json({ message: 'Eroare la verificarea codului' });
  }
};


const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email lipsă' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Utilizator inexistent' });
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '15m' });

    const resetLink = `http://localhost:3000/resetare-parola/${token}`;
    console.log('Link resetare:', resetLink);

    res.json({ message: 'Link de resetare trimis pe email (simulat)' });
  } catch (err) {
    console.error('Eroare link resetare:', err);
    res.status(500).json({ message: 'Eroare la generarea link-ului de resetare' });
  }
};

const exportPersonalData = async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (results.length === 0) {
      return res.status(500).json({ message: 'Eroare la export' });
    }

    const user = results[0];
    const content = JSON.stringify(user, null, 2);

    res.setHeader('Content-disposition', 'attachment; filename=user-data.json');
    res.setHeader('Content-type', 'application/json');
    res.send(content);
  } catch (err) {
    console.error('Eroare export date:', err);
    res.status(500).json({ message: 'Eroare la exportul datelor' });
  }
};
const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // ✅ Invalidate any active sessions/tokens in DB (optional)
    await pool.query(
      'UPDATE users SET last_logout = NOW() WHERE id = ?', 
      [userId]
    );
    
    // ✅ Clear any 2FA codes for security
    await pool.query(
      'UPDATE users SET two_factor_code = NULL, two_factor_expiry = NULL WHERE id = ?',
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Logout realizat cu succes' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la logout' 
    });
  }
};

// ✅ Export
module.exports = {
  registerUser,
  loginUser,
  logoutUser, 
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
  sendSupportMessage,
  sendAdminNotification,
  sendResetLink,
  send2FACode,
  verify2FACode,
  saveOrder,
  sendEmail,
  exportPersonalData
};