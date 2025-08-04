const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// ✅ Rezervările utilizatorului
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifică dacă utilizatorul are acces la rezervările solicitate
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    const [results] = await pool.query(`
      SELECT so.*, s.name AS service_name, s.category, s.price 
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.user_id = ?
      ORDER BY so.created_at DESC
    `, [userId]);
    
    res.json(results);
  } catch (err) {
    console.error('Eroare la încărcarea rezervărilor:', err);
    res.status(500).json({ message: 'Eroare la încărcarea rezervărilor' });
  }
});

// ✅ Creează rezervare nouă
router.post('/create', protect, async (req, res) => {
  try {
    const {
      serviceId,
      selectedDate,
      selectedTime,
      duration,
      address,
      phone,
      specialInstructions,
      contactMethod,
      urgency,
      additionalServices,
      totalAmount,
      serviceName,
      serviceCategory,
      paymentMethod
    } = req.body;

    // Validări
    if (!serviceId || !selectedDate || !selectedTime || !address || !phone) {
      return res.status(400).json({ 
        message: 'Câmpurile obligatorii lipsesc' 
      });
    }

    // Verifică din nou disponibilitatea
    const [conflicts] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM service_orders 
      WHERE service_id = ? AND date = ? AND time = ? AND status != 'anulat'
    `, [serviceId, selectedDate, selectedTime]);
    
    if (conflicts[0].count > 0) {
      return res.status(400).json({ 
        message: 'Slot-ul selectat nu mai este disponibil' 
      });
    }

    // Inserează rezervarea
    const [result] = await pool.query(`
      INSERT INTO service_orders (
        user_id, service_id, date, time, duration, address, phone, 
        special_instructions, contact_method, urgency, additional_services,
        total_amount, service_name, service_category, payment_method, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      req.user.id, serviceId, selectedDate, selectedTime, duration || 120,
      address, phone, specialInstructions || '', contactMethod || 'phone',
      urgency || 'normal', JSON.stringify(additionalServices || []),
      totalAmount, serviceName, serviceCategory, paymentMethod || 'cash'
    ]);

    // Returnează rezervarea creată
    const [newBooking] = await pool.query(`
      SELECT so.*, s.name AS service_name 
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      booking: newBooking[0],
      message: 'Rezervarea a fost creată cu succes'
    });

  } catch (err) {
    console.error('Eroare la crearea rezervării:', err);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea rezervării' 
    });
  }
});

// ✅ Actualizează statusul rezervării
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status invalid' });
    }

    // Verifică dacă utilizatorul are acces la această rezervare
    const [booking] = await pool.query(
      'SELECT * FROM service_orders WHERE id = ?', 
      [id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({ message: 'Rezervarea nu a fost găsită' });
    }
    
    if (booking[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis' });
    }

    // Actualizează statusul
    await pool.query(
      'UPDATE service_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Returnează rezervarea actualizată
    const [updatedBooking] = await pool.query(`
      SELECT so.*, s.name AS service_name 
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.id = ?
    `, [id]);

    res.json({
      success: true,
      booking: updatedBooking[0]
    });

  } catch (err) {
    console.error('Eroare la actualizarea statusului:', err);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea statusului' 
    });
  }
});

// ✅ Reprogramează rezervarea
router.patch('/:id/reschedule', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'Data și ora noi sunt obligatorii' });
    }

    // Verifică dacă utilizatorul are acces
    const [booking] = await pool.query(
      'SELECT * FROM service_orders WHERE id = ?', 
      [id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({ message: 'Rezervarea nu a fost găsită' });
    }
    
    if (booking[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Acces interzis' });
    }

    // Verifică disponibilitatea noului slot
    const [conflicts] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM service_orders 
      WHERE service_id = ? AND date = ? AND time = ? AND status != 'anulat' AND id != ?
    `, [booking[0].service_id, newDate, newTime, id]);
    
    if (conflicts[0].count > 0) {
      return res.status(400).json({ 
        message: 'Noul slot selectat nu este disponibil' 
      });
    }

    // Actualizează rezervarea
    await pool.query(`
      UPDATE service_orders 
      SET date = ?, time = ?, status = 'pending', updated_at = NOW() 
      WHERE id = ?
    `, [newDate, newTime, id]);

    // Returnează rezervarea actualizată
    const [updatedBooking] = await pool.query(`
      SELECT so.*, s.name AS service_name 
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.id = ?
    `, [id]);

    res.json({
      success: true,
      booking: updatedBooking[0],
      message: 'Rezervarea a fost reprogramată cu succes'
    });

  } catch (err) {
    console.error('Eroare la reprogramare:', err);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la reprogramarea rezervării' 
    });
  }
});

// ✅ Adaugă recenzie
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating invalid (1-5)' });
    }

    // Verifică dacă utilizatorul are acces și dacă serviciul este finalizat
    const [booking] = await pool.query(
      'SELECT * FROM service_orders WHERE id = ? AND user_id = ? AND status = "completed"', 
      [id, req.user.id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({ 
        message: 'Rezervarea nu a fost găsită sau nu este finalizată' 
      });
    }

    // Actualizează cu recenzia
    await pool.query(`
      UPDATE service_orders 
      SET rating = ?, review_comment = ?, reviewed_at = NOW() 
      WHERE id = ?
    `, [rating, comment || '', id]);

    // Returnează rezervarea actualizată
    const [updatedBooking] = await pool.query(`
      SELECT so.*, s.name AS service_name 
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      WHERE so.id = ?
    `, [id]);

    res.json({
      success: true,
      booking: updatedBooking[0],
      message: 'Recenzia a fost adăugată cu succes'
    });

  } catch (err) {
    console.error('Eroare la adăugarea recenziei:', err);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la adăugarea recenziei' 
    });
  }
});

module.exports = router;