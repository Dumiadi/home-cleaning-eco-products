const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  getUserOrders,
  getUserServiceOrders,
  bookService,
  getUnavailableDates,
  getAllServices,
  updateBooking,      
  cancelBooking         
} = require('../controllers/userController');


const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { sendSupportMessage } = require('../controllers/userController');
const { forgotPassword, resetPassword } = require('../controllers/userController');




// 🔐 Rute utilizator
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile); // doar userii logați
router.get('/orders', protect, getUserOrders);
router.get('/service-orders', protect, getUserServiceOrders);
router.post('/bookings', protect, bookService);
router.get('/bookings/ocupate', getUnavailableDates);
router.get('/services', getAllServices);
router.put('/bookings/:id/update', protect, updateBooking);
router.put('/bookings/:id/cancel', protect, cancelBooking);
router.post('/support', sendSupportMessage);
router.post('/forgot-password', forgotPassword);
router.post('/reset-request', sendResetLink);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-2fa', verify2FACode);



router.post('/upload-proof', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nicio imagine încărcată' });
  res.json({ message: 'Imagine încărcată', path: `/uploads/${req.file.filename}` });
});
router.post(
  '/upload-proof/:bookingId',
  protect,
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Nicio imagine încărcată' });

    const imagePath = `/uploads/${req.file.filename}`;
    const bookingId = req.params.bookingId;

    const sql = `
      UPDATE service_orders 
      SET proof_image = ? 
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [imagePath, bookingId, req.user.id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Eroare la salvare imagine' });
      res.json({ message: 'Imagine salvată cu succes', image: imagePath });
    });
  }
);

router.post('/upload-avatar', protect, upload.single('avatar'), (req, res) => {
  const imageUrl = req.file?.path;
  if (!imageUrl) return res.status(400).json({ message: 'Upload eșuat' });

  const sql = 'UPDATE users SET avatar = ? WHERE id = ?';
  db.query(sql, [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'Eroare la salvarea avatarului' });
    res.json({ message: 'Avatar actualizat', avatar: imageUrl });
  });
});


module.exports = router;
