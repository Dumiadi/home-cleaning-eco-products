
const express = require('express');
const router = express.Router();
const { send2FACode, verify2FACode } = require('../controllers/userController');

router.post('/send', send2FACode);
router.post('/verify', verify2FACode);

module.exports = router;
