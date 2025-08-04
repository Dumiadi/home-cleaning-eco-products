const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// ✅ Toate serviciile
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('Eroare la servicii:', err);
    res.status(500).json({ message: 'Eroare la încărcarea serviciilor' });
  }
});

// ✅ Servicii după categorie
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [results] = await pool.query(
      'SELECT * FROM services WHERE category = ? ORDER BY id DESC', 
      [category]
    );
    res.json(results);
  } catch (err) {
    console.error('Eroare la servicii categorie:', err);
    res.status(500).json({ message: 'Eroare la încărcarea serviciilor pentru categoria specificată' });
  }
});

// ✅ Căutare servicii
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Termen de căutare lipsă' });
    }
    
    const searchTerm = `%${q}%`;
    const [results] = await pool.query(`
      SELECT * FROM services 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      ORDER BY id DESC
    `, [searchTerm, searchTerm, searchTerm]);
    
    res.json(results);
  } catch (err) {
    console.error('Eroare la căutarea serviciilor:', err);
    res.status(500).json({ message: 'Eroare la căutarea serviciilor' });
  }
});

// ✅ Serviciu specific după ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Serviciul nu a fost găsit' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Eroare la încărcarea serviciului:', err);
    res.status(500).json({ message: 'Eroare la încărcarea serviciului' });
  }
});

// ✅ Verifică disponibilitatea pentru o dată
router.post('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    
    // Verifică dacă există rezervări pentru data și ora specificate
    const [conflicts] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM service_orders 
      WHERE service_id = ? AND date = ? AND time = ? AND status != 'anulat'
    `, [id, date, time]);
    
    const available = conflicts[0].count === 0;
    res.json({ available });
  } catch (err) {
    console.error('Eroare la verificarea disponibilității:', err);
    res.status(500).json({ message: 'Eroare la verificarea disponibilității' });
  }
});

// ✅ ÎMBUNĂTĂȚIT: Obține slot-uri disponibile pentru o dată
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data este obligatorie' 
      });
    }
    
    // Generează toate slot-urile posibile (8:00 - 18:30, la fiecare 30 min)
    const allSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(timeString);
      }
    }
    
    // ✅ ÎMBUNĂTĂȚIT: Găsește slot-urile ocupate cu mai multe detalii
    const [occupiedSlots] = await pool.query(`
      SELECT time, status, user_id, created_at
      FROM service_orders 
      WHERE service_id = ? AND date = ? AND status NOT IN ('anulat', 'respins')
      ORDER BY time ASC
    `, [id, date]);
    
    const occupiedTimes = occupiedSlots.map(slot => slot.time);
    
    // ✅ FILTREAZĂ SLOTURILE TRECUTE pentru ziua curentă
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    let availableSlots = allSlots.filter(slot => !occupiedTimes.includes(slot));
    
    // Dacă data selectată este ziua de azi, elimină sloturile care au trecut
    if (date === currentDate) {
      availableSlots = availableSlots.filter(slot => slot > currentTime);
    }
    
    // ✅ STATISTICI ADIȚIONALE
    const totalSlots = allSlots.length;
    const bookedSlots = occupiedSlots.length;
    const occupancyRate = Math.round((bookedSlots / totalSlots) * 100);
    
    res.json({
      success: true,
      slots: availableSlots,
      statistics: {
        total_slots: totalSlots,
        available_slots: availableSlots.length,
        booked_slots: bookedSlots,
        occupancy_rate: occupancyRate,
        date: date
      },
      occupied_details: occupiedSlots.map(slot => ({
        time: slot.time,
        status: slot.status,
        created_at: slot.created_at
      }))
    });
    
  } catch (err) {
    console.error('Eroare la încărcarea slot-urilor:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la încărcarea slot-urilor disponibile' 
    });
  }
});

// ✅ NOU: Marchează un slot ca rezervat
router.post('/:id/slots/book', protect, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { date, time, booking_data } = req.body;
    const user_id = req.user.id;
    
    // Validări
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Data și ora sunt obligatorii'
      });
    }
    
    // Începe tranzacția pentru siguranță
    await connection.beginTransaction();
    
    // ✅ VERIFICĂ DACĂ SLOTUL ESTE ÎNCĂ DISPONIBIL (double-booking prevention)
    const [existingBookings] = await connection.query(`
      SELECT id, status, user_id 
      FROM service_orders 
      WHERE service_id = ? AND date = ? AND time = ? AND status NOT IN ('anulat', 'respins')
    `, [id, date, time]);
    
    if (existingBookings.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Acest slot a fost deja rezervat de altcineva',
        conflict: {
          existing_booking_id: existingBookings[0].id,
          booked_by_same_user: existingBookings[0].user_id === user_id
        }
      });
    }
    
    // ✅ VERIFICĂ DACĂ SLOTUL NU A TRECUT (pentru ziua curentă)
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    if (date === currentDate && time <= currentTime) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nu poți rezerva un slot care a trecut'
      });
    }
    
    // ✅ CREEAZĂ REZERVAREA PRINCIPALĂ
    const bookingPayload = {
      service_id: id,
      user_id: user_id,
      date: date,
      time: time,
      status: 'confirmat',
      total_amount: booking_data?.totalAmount || 0,
      payment_method: booking_data?.paymentMethod || 'cash',
      payment_status: booking_data?.paymentStatus || 'pending',
      transaction_id: booking_data?.transactionId || null,
      address: booking_data?.address || '',
      phone: booking_data?.phone || '',
      special_instructions: booking_data?.specialInstructions || '',
      urgency: booking_data?.urgency || 'normal',
      additional_services: booking_data?.additionalServices ? JSON.stringify(booking_data.additionalServices) : null,
      created_at: new Date()
    };
    
    const [bookingResult] = await connection.query(`
      INSERT INTO service_orders SET ?
    `, [bookingPayload]);
    
    const newBookingId = bookingResult.insertId;
    
    // ✅ COMMIT tranzacția
    await connection.commit();
    
    // ✅ LOG pentru audit
    console.log(`✅ Slot ${time} on ${date} for service ${id} booked by user ${user_id}, booking ID: ${newBookingId}`);
    
    res.json({
      success: true,
      message: 'Slot rezervat cu succes',
      booking: {
        id: newBookingId,
        service_id: id,
        date: date,
        time: time,
        status: 'confirmat'
      },
      slot_info: {
        date: date,
        time: time,
        blocked: true
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error booking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la rezervarea slotului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// ✅ NOU: Eliberează un slot (pentru anulări)
router.delete('/:id/slots/release', protect, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { date, time, booking_id } = req.body;
    const user_id = req.user.id;
    
    await connection.beginTransaction();
    
    // Verifică dacă utilizatorul are dreptul să anuleze
    const [userBooking] = await connection.query(`
      SELECT id, status, user_id 
      FROM service_orders 
      WHERE service_id = ? AND date = ? AND time = ? AND status NOT IN ('anulat', 'finalizat')
      ${booking_id ? 'AND id = ?' : ''}
    `, booking_id ? [id, date, time, booking_id] : [id, date, time]);
    
    if (userBooking.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Rezervarea nu a fost găsită sau nu poate fi anulată'
      });
    }
    
    // Verifică dacă utilizatorul este proprietarul rezervării
    if (userBooking[0].user_id !== user_id) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Nu aveți dreptul să anulați această rezervare'
      });
    }
    
    // Marchează rezervarea ca anulată (nu o șterge complet pentru audit)
    await connection.query(`
      UPDATE service_orders 
      SET status = 'anulat', cancelled_at = NOW(), cancelled_by = ?
      WHERE id = ?
    `, [user_id, userBooking[0].id]);
    
    await connection.commit();
    
    console.log(`📅 Slot ${time} on ${date} for service ${id} released by user ${user_id}`);
    
    res.json({
      success: true,
      message: 'Rezervarea a fost anulată cu succes',
      released_slot: {
        date: date,
        time: time,
        available: true
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error releasing slot:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea rezervării'
    });
  } finally {
    connection.release();
  }
});

// ✅ NOU: Obține statistici despre rezervări pentru o perioadă
router.get('/:id/slots/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, period = 'day' } = req.query; // day, week, month
    
    let dateCondition = '';
    let groupBy = '';
    let dateFormat = '';
    
    switch (period) {
      case 'week':
        dateCondition = 'date >= DATE_SUB(?, INTERVAL 7 DAY) AND date <= ?';
        groupBy = 'DATE(date)';
        dateFormat = 'DATE_FORMAT(date, "%Y-%m-%d") as period';
        break;
      case 'month':
        dateCondition = 'MONTH(date) = MONTH(?) AND YEAR(date) = YEAR(?)';
        groupBy = 'DATE(date)';
        dateFormat = 'DATE_FORMAT(date, "%Y-%m-%d") as period';
        break;
      default:
        dateCondition = 'date = ?';
        groupBy = 'time';
        dateFormat = 'time as period';
    }
    
    const [stats] = await pool.query(`
      SELECT 
        ${dateFormat},
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmat' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'anulat' THEN 1 END) as cancelled_bookings,
        AVG(total_amount) as avg_amount,
        SUM(total_amount) as total_revenue
      FROM service_orders 
      WHERE service_id = ? AND ${dateCondition}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `, period === 'month' ? [id, date, date] : [id, date]);
    
    const totalSlots = period === 'day' ? 22 : null; // 8:00-18:30, câte 30 min = 22 slots per zi
    
    res.json({
      success: true,
      service_id: id,
      period: period,
      date: date,
      statistics: stats,
      summary: period === 'day' ? {
        total_possible_slots: totalSlots,
        occupied_slots: stats.length,
        available_slots: totalSlots - stats.length,
        occupancy_rate: Math.round((stats.length / totalSlots) * 100)
      } : null
    });
    
  } catch (error) {
    console.error('❌ Error fetching slot stats:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor'
    });
  }
});

// ✅ NOU: Cleanup pentru rezervări expirate (rulează manual sau cu cron job)
router.post('/:id/slots/cleanup', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Marchează ca expirate rezervările pending care au trecut de data/ora programată
    const [cleanupResult] = await pool.query(`
      UPDATE service_orders 
      SET status = 'expirat', updated_at = NOW()
      WHERE service_id = ? 
      AND status = 'pending' 
      AND CONCAT(date, ' ', time) < NOW()
    `, [id]);
    
    res.json({
      success: true,
      message: `Cleanup complet: ${cleanupResult.affectedRows} rezervări marcate ca expirate`,
      cleaned_bookings: cleanupResult.affectedRows
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la cleanup-ul rezervărilor'
    });
  }
});

module.exports = router;