// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  sendContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  replyToMessage
} = require('../controllers/contactController');

// ✅ RUTA PUBLICĂ - Trimite mesaj de contact
router.post('/', sendContactMessage);

// ✅ RUTE ADMIN - Gestionare mesaje
router.get('/admin', protect, requireAdmin, getAllContactMessages);
router.patch('/admin/:id/read', protect, requireAdmin, markMessageAsRead);
router.post('/admin/:id/reply', protect, requireAdmin, replyToMessage);

module.exports = router;