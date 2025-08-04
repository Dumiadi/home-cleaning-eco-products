// ✅ userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  getProfile,
  getUserOrders,
  getUserServiceOrders,
  bookService,
  getUnavailableDates,
  getAllServices,
  updateBooking,
  cancelBooking,
  sendSupportMessage,
  forgotPassword,
  resetPassword,
  sendResetLink,
  send2FACode,
  verify2FACode,
  exportPersonalData,
  saveOrder,
  sendEmail
} = require('../controllers/userController');

// 🔐 Autentificare
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile); // ✅ Pentru Google OAuth

// 📦 Comenzi și programări
router.get('/orders', protect, getUserOrders);
router.get('/service-orders', protect, getUserServiceOrders);
router.post('/new-order', saveOrder);

// 🧼 Servicii și rezervări
router.get('/services', getAllServices);
router.post('/bookings', protect, bookService);
router.get('/bookings/ocupate', getUnavailableDates);
router.put('/bookings/:id/update', protect, updateBooking);
router.put('/bookings/:id/cancel', protect, cancelBooking);

// 🔐 Resetare parolă și 2FA
router.post('/forgot-password', forgotPassword);
router.post('/reset-request', sendResetLink);
router.post('/reset-password/:token', resetPassword);
router.post('/2fa/send', send2FACode);
router.post('/2fa/verify', verify2FACode);

// 📧 Contact și utilități
router.post('/support', sendSupportMessage); 
router.post('/contact', handleContactForm);   
router.get('/export', protect, exportPersonalData);
router.put('/update', protect, updateUser);

// 🖼️ Upload fișiere
router.post('/upload-proof', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nicio imagine încărcată' });
  res.json({ message: 'Imagine încărcată', path: `/uploads/${req.file.filename}` });
});

router.post('/upload-proof/:bookingId', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Nicio imagine încărcată' });

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'proofs',
            resource_type: 'image',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const uploadResult = await streamUpload(req.file.buffer);

    const imagePath = uploadResult.secure_url;
    const bookingId = req.params.bookingId;

    const sql = `
      UPDATE service_orders 
      SET proof_image = ? 
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [imagePath, bookingId, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Eroare la salvarea imaginii' });
      res.json({ message: 'Imagine salvată cu succes', imagePath });
    });
  } catch (error) {
    console.error('Eroare la upload Cloudinary:', error);
    res.status(500).json({ message: 'Eroare server la încărcare imagine' });
  }
});

router.post('/upload-avatar', protect, upload.single('avatar'), (req, res) => {
  const imageUrl = req.file?.path;
  if (!imageUrl) return res.status(400).json({ message: 'Upload eșuat' });
  
  const sql = 'UPDATE users SET avatar = ? WHERE id = ?';
  db.query(sql, [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'Eroare la salvarea avatarului' });
    res.json({ message: 'Avatar actualizat', avatar: imageUrl });
  });
});

// ✅ FUNCȚIE NOUĂ: Contact Form Handler
async function handleContactForm(req, res) {
  try {
    const { 
      name, 
      email, 
      phone, 
      subject, 
      message, 
      serviceType, 
      preferredContact 
    } = req.body;
    
    // Validări de bază
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Toate câmpurile obligatorii trebuie completate' 
      });
    }
    
    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formatul email-ului nu este valid' 
      });
    }
    
    // Salvează în baza de date
    const sql = `
      INSERT INTO contact_messages (
        name, email, phone, subject, message, 
        service_type, preferred_contact, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'new')
    `;
    
    await db.query(sql, [
      name, 
      email, 
      phone || null, 
      subject, 
      message, 
      serviceType || null, 
      preferredContact || 'email'
    ]);
    
    // ✅ Opțional: Trimite email de notificare către admin
    try {
      await sendEmailNotification({
        to: 'contact@curatenie-eco.ro', // Schimbă cu email-ul tău
        subject: `Mesaj nou de contact: ${subject}`,
        html: `
          <h3>📧 Mesaj nou de contact</h3>
          <p><strong>Nume:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone || 'Nu a fost furnizat'}</p>
          <p><strong>Tip serviciu:</strong> ${serviceType || 'Nu a fost specificat'}</p>
          <p><strong>Contact preferat:</strong> ${preferredContact || 'email'}</p>
          <p><strong>Subiect:</strong> ${subject}</p>
          <p><strong>Mesaj:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
          <hr>
          <p><small>Trimis de pe site-ul curatenie-eco.ro</small></p>
        `
      });
    } catch (emailError) {
      console.error('Eroare la trimiterea email-ului de notificare:', emailError);
      // Nu oprim procesul dacă email-ul nu se trimite
    }
    
    res.json({ 
      success: true, 
      message: 'Mesajul a fost trimis cu succes! Îți vom răspunde în cel mai scurt timp.' 
    });
    
  } catch (error) {
    console.error('Eroare la procesarea mesajului de contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la trimiterea mesajului. Te rugăm să încerci din nou.' 
    });
  }
}

// ✅ Funcție pentru trimiterea email-urilor (dacă nu există deja)
async function sendEmailNotification({ to, subject, html }) {
  try {
    const nodemailer = require('nodemailer');
    
    // Configurare transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Configurări de securitate suplimentare
      secure: false,
      requireTLS: true,
      port: 587
    });

    console.log('📧 Trimitem email către:', to);
    console.log('📝 Subiect:', subject);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
      // Opțional: configurări suplimentare
      replyTo: process.env.EMAIL_USER
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email trimis cu succes:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('❌ Eroare trimitere email:', error);
    
    // Tratare erori specifice
    if (error.code === 'EAUTH') {
      console.error('🔒 Eroare autentificare. Verifică credențialele.');
    }
    
    throw error;
  }
}
module.exports = router;