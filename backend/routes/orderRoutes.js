const express = require('express');
const router = express.Router();
const {
  saveOrder,
  getOrders,
  sendInvoiceEmail
} = require('../controllers/orderController');

// Comenzi produse
router.post('/new-order', saveOrder);
router.get('/', getOrders);

// Trimitere email cu factură
router.post('/send-email', sendInvoiceEmail);

module.exports = router;
