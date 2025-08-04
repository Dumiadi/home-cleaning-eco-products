const express = require('express');
const router = express.Router();
const { 
    sendSupportMessage, 
    getSupportMessages, 
    resolveSupportMessage 
} = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Trimite mesaj de suport (utilizator)
router.post('/support', protect, sendSupportMessage);

// Preia mesaje suport (admin)
router.get('/support-messages', protect, requireAdmin, getSupportMessages);

// Rezolvă mesaj suport (admin)
router.post('/support-messages/:id/resolve', protect, requireAdmin, resolveSupportMessage);

module.exports = router;