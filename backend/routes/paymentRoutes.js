const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Simulare Stripe pentru plăți cu cardul
const processStripePayment = async (paymentData) => {
  // În production, aici ai integra cu Stripe real
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    // Simulare procesare cu Stripe
    console.log('Processing payment:', paymentData);
    
    // Simulare delay pentru API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulare răspuns Stripe
    const mockStripeResponse = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentData.amount * 100, // Stripe folosește cenți
      currency: paymentData.currency.toLowerCase(),
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000),
      payment_method: {
        card: {
          brand: 'visa', // Detectat din numărul cardului
          last4: paymentData.card.number.slice(-4),
          exp_month: parseInt(paymentData.card.exp_month),
          exp_year: parseInt(paymentData.card.exp_year)
        }
      }
    };
    
    return mockStripeResponse;
  } catch (error) {
    throw new Error('Payment processing failed');
  }
};

// ✅ Procesează plata cu cardul
router.post('/process-card', protect, async (req, res) => {
  try {
    const { amount, currency, card, booking_id, description } = req.body;
    
    // Validări
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Suma invalidă' });
    }
    
    if (!card || !card.number || !card.exp_month || !card.exp_year || !card.cvc) {
      return res.status(400).json({ message: 'Datele cardului sunt incomplete' });
    }
    
    // Procesează plata cu Stripe (simulat)
    const stripeResponse = await processStripePayment({
      amount,
      currency,
      card,
      description
    });
    
    // Salvează tranzacția în baza de date
    const [paymentResult] = await pool.query(`
      INSERT INTO payments (
        user_id, booking_id, amount, currency, payment_method, 
        transaction_id, payment_status, stripe_payment_id, 
        card_last4, card_brand, created_at
      ) VALUES (?, ?, ?, ?, 'card', ?, 'completed', ?, ?, ?, NOW())
    `, [
      req.user.id, 
      booking_id, 
      amount, 
      currency,
      stripeResponse.id,
      stripeResponse.id,
      stripeResponse.payment_method.card.last4,
      stripeResponse.payment_method.card.brand
    ]);
    
    // Actualizează statusul rezervării
    if (booking_id) {
      await pool.query(
        'UPDATE service_orders SET payment_status = "paid", updated_at = NOW() WHERE id = ?',
        [booking_id]
      );
    }
    
    res.json({
      success: true,
      transaction_id: stripeResponse.id,
      payment_id: paymentResult.insertId,
      message: 'Plata a fost procesată cu succes'
    });
    
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Eroare la procesarea plății cu cardul' 
    });
  }
});

// ✅ Procesează plata în numerar
router.post('/process-cash', protect, async (req, res) => {
  try {
    const { amount, booking_id, description } = req.body;
    
    // Salvează tranzacția cash
    const [paymentResult] = await pool.query(`
      INSERT INTO payments (
        user_id, booking_id, amount, currency, payment_method, 
        transaction_id, payment_status, created_at
      ) VALUES (?, ?, ?, 'RON', 'cash', ?, 'pending', NOW())
    `, [
      req.user.id, 
      booking_id, 
      amount,
      `CASH_${Date.now()}_${req.user.id}`
    ]);
    
    // Actualizează statusul rezervării
    if (booking_id) {
      await pool.query(
        'UPDATE service_orders SET payment_status = "pending_cash", updated_at = NOW() WHERE id = ?',
        [booking_id]
      );
    }
    
    res.json({
      success: true,
      transaction_id: `CASH_${Date.now()}_${req.user.id}`,
      payment_id: paymentResult.insertId,
      message: 'Plata în numerar a fost înregistrată'
    });
    
  } catch (error) {
    console.error('Cash payment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la înregistrarea plății în numerar' 
    });
  }
});

// ✅ Procesează transferul bancar
router.post('/process-transfer', protect, async (req, res) => {
  try {
    const { amount, booking_id, description } = req.body;
    
    // Salvează tranzacția transfer
    const [paymentResult] = await pool.query(`
      INSERT INTO payments (
        user_id, booking_id, amount, currency, payment_method, 
        transaction_id, payment_status, created_at
      ) VALUES (?, ?, ?, 'RON', 'transfer', ?, 'pending', NOW())
    `, [
      req.user.id, 
      booking_id, 
      amount,
      `TRANSFER_${Date.now()}_${req.user.id}`
    ]);
    
    // Actualizează statusul rezervării
    if (booking_id) {
      await pool.query(
        'UPDATE service_orders SET payment_status = "pending_transfer", updated_at = NOW() WHERE id = ?',
        [booking_id]
      );
    }
    
    res.json({
      success: true,
      transaction_id: `TRANSFER_${Date.now()}_${req.user.id}`,
      payment_id: paymentResult.insertId,
      message: 'Transferul bancar a fost înregistrat'
    });
    
  } catch (error) {
    console.error('Transfer payment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la înregistrarea transferului bancar' 
    });
  }
});

// ✅ Verifică statusul unei plăți
router.get('/status/:transactionId', protect, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const [payments] = await pool.query(`
      SELECT p.*, so.service_name, u.email
      FROM payments p
      LEFT JOIN service_orders so ON p.booking_id = so.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.transaction_id = ? AND p.user_id = ?
    `, [transactionId, req.user.id]);
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Plata nu a fost găsită' });
    }
    
    res.json({
      success: true,
      payment: payments[0]
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la verificarea statusului plății' 
    });
  }
});

// ✅ Istoricul plăților utilizatorului
router.get('/history', protect, async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, so.service_name, so.date, so.time
      FROM payments p
      LEFT JOIN service_orders so ON p.booking_id = so.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    
    res.json({
      success: true,
      payments
    });
    
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la încărcarea istoricului plăților' 
    });
  }
});

// ✅ Webhook pentru Stripe (pentru production)
router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    // În production, aici ai valida webhook-ul Stripe
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Pentru moment, simulăm
    console.log('Stripe webhook received');
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

module.exports = router;