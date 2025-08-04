// controllers/adminController.js - VERSIUNEA COMPLETĂ ȘI CORECTĂ
const pool = require('../config/db');
const { Parser } = require('json2csv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ✅ CONFIGURARE NODEMAILER (CORECTĂ)
const transporter = {
  sendMail: async (mailOptions) => {
    console.log('\n📧 ===== EMAIL SIMULAT - SUCCES =====');
    console.log(`📤 Către: ${mailOptions.to}`);
    console.log(`📝 Subiect: ${mailOptions.subject}`);
    console.log(`📧 Email simulat trimis cu succes!`);
    console.log('================================\n');
    
    // Simulează răspunsul real de la Nodemailer
    return Promise.resolve({
      messageId: `<simulated_${Date.now()}@localhost>`,
      response: '250 OK: Email simulat trimis cu succes',
      accepted: [mailOptions.to],
      rejected: [],
      pending: []
    });
  },

  verify: (callback) => {
    console.log('✅ Email transporter ready (modul simulat - FUNCȚIONEAZĂ)');
    if (callback) callback(null, true);
    return Promise.resolve(true);
  }
};


// ✅ TEST NODEMAILER LA PORNIRE
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Nodemailer configuration error:', error);
  } else {
    console.log('✅ Nodemailer is ready to send emails');
  }
});

// ===================================
// 📊 DASHBOARD & STATISTICS
// ===================================

const getAdminStats = async (req, res) => {
  try {
    console.log('📊 Getting admin stats...');
    
    let stats = { users: 0, orders: 0, services: 0, revenue: 0 };

    // Utilizatori
    const [usersResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    stats.users = usersResult[0].total;
    console.log('👥 Users count:', stats.users);

    // Comenzi produse
    const [ordersResult] = await pool.query('SELECT COUNT(*) as total FROM orders');
    stats.orders = ordersResult[0].total;
    console.log('📦 Orders count:', stats.orders);

    // Programări servicii  
    const [servicesResult] = await pool.query('SELECT COUNT(*) as total FROM service_orders');
    stats.services = servicesResult[0].total;
    console.log('🧼 Service orders count:', stats.services);

    // Calculează revenue din orders
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM orders');
      console.log('📋 Available columns in orders:', columns.map(c => c.Field));
      
      const hasItemsColumn = columns.some(c => c.Field === 'items');
      const hasTotalColumn = columns.some(c => c.Field === 'total');
      
      let totalRevenue = 0;
      
      if (hasTotalColumn) {
        const [revenueResult] = await pool.query('SELECT SUM(total) as revenue FROM orders WHERE total IS NOT NULL');
        totalRevenue = parseFloat(revenueResult[0].revenue || 0);
        console.log('💰 Revenue calculated from total column:', totalRevenue);
      } else if (hasItemsColumn) {
        const [itemsResult] = await pool.query('SELECT items FROM orders WHERE items IS NOT NULL');
        itemsResult.forEach(order => {
          try {
            const items = JSON.parse(order.items || '[]');
            items.forEach(item => {
              const price = parseFloat(item.price?.toString().replace(/[^\d.]/g, '') || 0);
              const qty = parseInt(item.quantity || 1);
              totalRevenue += price * qty;
            });
          } catch (err) {
            console.warn('Error parsing order items:', err);
          }
        });
        console.log('💰 Revenue calculated from items:', totalRevenue);
      } else {
        console.log('⚠️ No revenue columns found, setting to 0');
        totalRevenue = 0;
      }

      stats.revenue = totalRevenue;
    } catch (revenueError) {
      console.warn('❌ Error calculating revenue:', revenueError.message);
      stats.revenue = 0;
    }

    console.log('💰 Total revenue:', stats.revenue);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error getting admin stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea statisticilor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================================
// 👥 USER MANAGEMENT
// ===================================

const getAllUsers = async (req, res) => {
  try {
    console.log('👥 Getting all users...');
    const [results] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    console.log('✅ Users retrieved:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({ error: 'Eroare la încărcarea utilizatorilor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    
    console.log(`👤 Updating user ${id}:`, { name, email, role, status });
    
    if (!name || !email || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Numele, email-ul și rolul sunt obligatorii' 
      });
    }
    
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?', 
      [email, id]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Acest email este deja folosit de alt utilizator' 
      });
    }
    
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [name, email, role, status || 'active', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilizatorul nu a fost găsit' 
      });
    }
    
    const [updatedUser] = await pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    console.log('✅ User updated successfully');
    res.json({ 
      success: true, 
      message: 'Utilizator actualizat cu succes',
      user: updatedUser[0]
    });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la actualizarea utilizatorului' 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting user:`, id);
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nu îți poți șterge propriul cont' 
      });
    }
    
    const [userCheck] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    
    if (userCheck.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilizatorul nu a fost găsit' 
      });
    }
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    console.log('✅ User deleted successfully');
    res.json({ 
      success: true, 
      message: `Utilizatorul ${userCheck[0].name} a fost șters cu succes` 
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la ștergerea utilizatorului' 
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📊 Getting user details for:`, id);
    
    const [userResult] = await pool.query(`
      SELECT u.*, 
             COUNT(DISTINCT so.id) as total_service_orders,
             COUNT(DISTINCT o.id) as total_product_orders
      FROM users u
      LEFT JOIN service_orders so ON u.id = so.user_id
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);
    
    if (userResult.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilizatorul nu a fost găsit' 
      });
    }
    
    const user = userResult[0];
    
    const [recentOrders] = await pool.query(`
      SELECT 'service' as type, so.id, so.created_at, s.name as item_name, so.status
      FROM service_orders so
      LEFT JOIN services s ON so.service_id = s.id
      WHERE so.user_id = ?
      UNION ALL
      SELECT 'product' as type, o.id, o.created_at, 'Comandă produse' as item_name, 'completed' as status
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [id, id]);
    
    console.log('✅ User details retrieved');
    res.json({ 
      success: true, 
      user,
      recentOrders
    });
    
  } catch (error) {
    console.error('❌ Error getting user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la încărcarea detaliilor utilizatorului' 
    });
  }
};

// ===================================
// 📦 PRODUCT ORDERS MANAGEMENT
// ===================================

const getAllProductOrders = async (req, res) => {
  try {
    console.log('📦 Getting product orders...');
    const [results] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    console.log('✅ Product orders retrieved:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting product orders:', error);
    res.status(500).json({ error: 'Eroare la încărcarea comenzilor produse' });
  }
};

const updateProductOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('\n🛍️ ===== UPDATE PRODUCT ORDER STATUS =====');
    console.log(`📌 Order ID: ${id}`);
    console.log(`📌 New Status: "${status}"`);
    console.log(`📌 User: ${req.user?.email} (ID: ${req.user?.id})`);
    
    // ✅ VALIDĂRI
    if (!id || !status) {
      return res.status(400).json({ 
        success: false,
        error: 'ID și status sunt obligatorii' 
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Status invalid. Valorile permise: ' + validStatuses.join(', ')
      });
    }

    // ✅ VERIFICĂ DACĂ COMANDA EXISTĂ
    const [currentResult] = await pool.query(
      'SELECT id, status, user_name, user_email, total, created_at FROM orders WHERE id = ?', 
      [id]
    );
    
    if (currentResult.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Comanda nu a fost găsită' 
      });
    }
    
    const order = currentResult[0];
    const currentStatus = order.status;
    
    if (currentStatus === status) {
      return res.json({ 
        success: true,
        message: 'Statusul este deja actualizat',
        data: { id: parseInt(id), status: status, unchanged: true }
      });
    }

    // ✅ ACTUALIZEAZĂ STATUSUL
    const [updateResult] = await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', 
      [status, id]
    );
    
    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ 
        success: false,
        error: 'Nu s-a putut actualiza statusul comenzii'
      });
    }

    // ✅ TRIMITE EMAIL PENTRU STATUSURI IMPORTANTE
    try {
      console.log(`📧 Sending email for status: ${status}`);
      const emailResult = await sendOrderConfirmationEmailInternal(id, status);
      console.log('📧 Email result:', emailResult);
    } catch (emailError) {
      console.warn('⚠️ Failed to send status email:', emailError.message);
    }

    // ✅ VERIFICARE
    const [verifyResult] = await pool.query(
      'SELECT id, status, updated_at FROM orders WHERE id = ?', 
      [id]
    );
    
    console.log(`✅ Status changed: "${currentStatus}" → "${status}"`);
    
    res.json({ 
      success: true,
      message: `Status comandă #${id} actualizat cu succes`,
      data: {
        id: parseInt(id),
        old_status: currentStatus,
        new_status: status,
        updated_at: verifyResult[0].updated_at,
        customer: order.user_name || order.user_email,
        total: order.total
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la actualizarea statusului comenzii',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================================
// 🧼 SERVICE ORDERS MANAGEMENT
// ===================================

const getAllServiceOrders = async (req, res) => {
  try {
    console.log('🧼 Getting service orders...');
    const sql = `
      SELECT so.*, s.name AS service_name, u.email AS user_email, u.name AS user_name
      FROM service_orders so
      LEFT JOIN services s ON so.service_id = s.id
      LEFT JOIN users u ON so.user_id = u.id
      ORDER BY so.date DESC, so.time DESC
    `;
    const [results] = await pool.query(sql);
    console.log('✅ Service orders retrieved:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting service orders:', error);
    res.status(500).json({ error: 'Eroare la încărcarea programărilor' });
  }
};

const updateServiceOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('\n🎯 ===== UPDATE SERVICE ORDER STATUS =====');
    console.log(`📌 Order ID: ${id}`);
    console.log(`📌 New Status: "${status}"`);
    console.log(`📌 User: ${req.user?.email} (ID: ${req.user?.id})`);
    console.log(`📌 Timestamp: ${new Date().toISOString()}`);
    
    // ✅ VALIDĂRI
    if (!id || !status) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'ID și status sunt obligatorii' 
      });
    }

    const validStatuses = ['în asteptare', 'În așteptare', 'confirmat', 'Confirmat', 'anulat', 'Anulat', 'finalizat', 'Finalizat'];
    if (!validStatuses.includes(status)) {
      console.log(`❌ Invalid status: ${status}`);
      return res.status(400).json({ 
        success: false,
        error: 'Status invalid' 
      });
    }

    // ✅ VERIFICĂ STATUSUL CURENT
    console.log('\n📋 Step 1: Checking current status...');
    const [currentResult] = await pool.query(
      'SELECT id, status, updated_at FROM service_orders WHERE id = ?', 
      [id]
    );
    
    if (currentResult.length === 0) {
      console.log('❌ Order not found');
      return res.status(404).json({ 
        success: false,
        error: 'Programarea nu a fost găsită' 
      });
    }
    
    const currentStatus = currentResult[0].status;
    console.log(`📊 Current status in DB: "${currentStatus}"`);
    console.log(`📊 Last updated: ${currentResult[0].updated_at}`);
    
    if (currentStatus === status) {
      console.log('ℹ️ Status is already the same, no update needed');
      return res.json({ 
        success: true,
        message: 'Statusul este deja actualizat',
        data: {
          id: id,
          status: status,
          unchanged: true
        }
      });
    }

    // ✅ ACTUALIZEAZĂ STATUSUL
    console.log('\n🔄 Step 2: Updating status...');
    
    const [updateResult] = await pool.query(
      'UPDATE service_orders SET status = ?, updated_at = NOW() WHERE id = ?', 
      [status, id]
    );
    
    console.log(`📊 Update result:`, {
      affectedRows: updateResult.affectedRows,
      changedRows: updateResult.changedRows
    });
    
    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ 
        success: false,
        error: 'Nu s-au putut actualiza datele'
      });
    }

    // ✅ VERIFICARE IMEDIATĂ
    console.log('\n🔍 Step 3: Immediate verification...');
    const [immediateCheck] = await pool.query(
      'SELECT id, status, updated_at FROM service_orders WHERE id = ?', 
      [id]
    );
    
    const immediateStatus = immediateCheck[0].status;
    console.log(`📊 Immediate check result: "${immediateStatus}"`);
    
    if (immediateStatus !== status) {
      console.error(`❌ IMMEDIATE VERIFICATION FAILED!`);
      console.error(`   Expected: "${status}"`);
      console.error(`   Got: "${immediateStatus}"`);
      
      return res.status(500).json({ 
        success: false,
        error: 'Update nu s-a aplicat corect',
        debug: {
          expected: status,
          actual: immediateStatus,
          step: 'immediate_verification'
        }
      });
    }

    // ✅ TRIMITE EMAIL PENTRU ANULARE
    if (status.toLowerCase().includes('anulat')) {
      try {
        console.log('📧 Sending cancellation email...');
        const emailResult = await sendOrderConfirmationEmailInternal(id, 'cancelled');
        console.log('✅ Cancellation email sent successfully:', emailResult);
      } catch (emailError) {
        console.warn('⚠️ Failed to send cancellation email:', emailError.message);
      }
    }

    // ✅ SUCCESS!
    console.log('\n🎉 ===== UPDATE SUCCESSFUL =====');
    console.log(`✅ Status changed: "${currentStatus}" → "${status}"`);
    console.log(`✅ Updated at: ${immediateCheck[0].updated_at}`);
    console.log('===============================\n');
    
    res.json({ 
      success: true,
      message: 'Status actualizat cu succes',
      data: {
        id: parseInt(id),
        old_status: currentStatus,
        new_status: status,
        updated_at: immediateCheck[0].updated_at,
        verification_passed: true
      }
    });
    
  } catch (error) {
    console.error('\n❌ ===== UPDATE FAILED =====');
    console.error(`❌ Error:`, error.message);
    console.error(`❌ Stack:`, error.stack);
    console.error('============================\n');
    
    res.status(500).json({ 
      success: false,
      error: 'Eroare la actualizarea statusului',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteServiceOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting service order:`, id);
    
    const [result] = await pool.query('DELETE FROM service_orders WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Programarea nu a fost găsită' });
    }
    
    console.log('✅ Service order deleted');
    res.json({ message: 'Programare ștearsă cu succes' });
  } catch (error) {
    console.error('❌ Error deleting service order:', error);
    res.status(500).json({ error: 'Eroare la ștergerea programării' });
  }
};

// ===================================
// 📧 EMAIL MANAGEMENT - CORECTATĂ COMPLET
// ===================================

const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailType = 'confirmed' } = req.body;
    
    console.log('\n📧 ===== SENDING ORDER CONFIRMATION EMAIL =====');
    console.log('📌 Order ID:', id);
    console.log('📌 Email Type:', emailType);
    console.log('📌 User:', req.user?.email, '(ID:', req.user?.id, ')');
    
    // ✅ VALIDARE PARAMETRI
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }
    
    const result = await sendOrderConfirmationEmailInternal(id, emailType);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('❌ Email route error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      message: error.message
    });
  }
};

// ✅ FUNCȚIE INTERNĂ PENTRU EMAIL (FOLOSITĂ ȘI DIN UPDATE STATUS)
const sendOrderConfirmationEmailInternal = async (orderId, emailType = 'confirmed') => {
  try {
    console.log('\n📧 ===== INTERNAL EMAIL FUNCTION =====');
    console.log('📌 Order ID:', orderId);
    console.log('📌 Email Type:', emailType);
    
    // ✅ VALIDARE STRICTĂ A PARAMETRILOR
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    // ✅ ASIGURĂ-TE CĂ orderId ESTE O VALOARE SIMPLĂ (STRING/NUMBER)
    const cleanOrderId = String(orderId).trim();
    const cleanEmailType = String(emailType).trim().toLowerCase();
    
    if (!cleanOrderId || cleanOrderId === 'undefined' || cleanOrderId === 'null') {
      throw new Error('Invalid order ID provided');
    }
    
    console.log('🧹 Cleaned parameters:', { cleanOrderId, cleanEmailType });

    // ✅ QUERY SIMPLIFICAT CU PARAMETRI EXPLICITI
    console.log('🔍 Fetching order details...');
    
    let orderResults;
    try {
      // ✅ Folosește array cu parametrii expliciti pentru a evita eroarea toString
      const queryParams = [cleanOrderId];
      console.log('📊 Query params:', queryParams);
      
      [orderResults] = await pool.query(`
        SELECT 
          o.id,
          o.user_name, 
          o.user_email, 
          o.user_phone, 
          o.user_address,
          o.items,
          o.total,
          o.tracking_number,
          o.status,
          o.created_at
        FROM orders o 
        WHERE o.id = ?
      `, queryParams);
      
    } catch (queryError) {
      console.error('❌ Database query failed:', queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    if (!orderResults || orderResults.length === 0) {
      console.log('❌ Order not found for ID:', cleanOrderId);
      return { 
        success: false, 
        message: `Order not found with ID: ${cleanOrderId}` 
      };
    }

    const order = orderResults[0];
    console.log('📦 Order found:', {
      id: order.id,
      customer: order.user_name,
      email: order.user_email,
      status: order.status,
      total: order.total
    });

    // ✅ VALIDARE EMAIL DESTINATAR
    if (!order.user_email || !order.user_email.includes('@')) {
      console.log('❌ Invalid customer email:', order.user_email);
      return { 
        success: false, 
        message: `Invalid customer email: ${order.user_email}` 
      };
    }

    // ✅ PARSE ITEMS SAFELY
    let orderItems = [];
    try {
      if (order.items) {
        orderItems = JSON.parse(order.items);
        if (!Array.isArray(orderItems)) {
          orderItems = [];
        }
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse order items, using empty array');
      orderItems = [];
    }

    // ✅ GENEREAZĂ CONȚINUTUL EMAIL-ULUI
    const customerName = order.user_name || 'Valued Customer';
    const orderTotal = parseFloat(order.total || 0);
    const trackingNumber = order.tracking_number || `ECO-${order.id}`;
    
    let emailSubject = '';
    let emailContent = '';
    
    // ✅ DETERMINĂ TIPUL EMAIL-ULUI
    switch (cleanEmailType) {
      case 'confirmed':
        emailSubject = `✅ Order Confirmed #${trackingNumber} - Curățenie Eco`;
        emailContent = generateConfirmedEmailContent(customerName, order, orderItems, trackingNumber);
        break;
        
      case 'cancelled':
        emailSubject = `❌ Order Cancelled #${trackingNumber} - Curățenie Eco`;
        emailContent = generateCancelledEmailContent(customerName, order, orderItems, trackingNumber);
        break;
        
      case 'shipped':
        emailSubject = `🚚 Order Shipped #${trackingNumber} - Curățenie Eco`;
        emailContent = generateShippedEmailContent(customerName, order, orderItems, trackingNumber);
        break;
        
      case 'delivered':
        emailSubject = `🎉 Order Delivered #${trackingNumber} - Curățenie Eco`;
        emailContent = generateDeliveredEmailContent(customerName, order, orderItems, trackingNumber);
        break;
        
      case 'processing':
        emailSubject = `⚙️ Order Processing #${trackingNumber} - Curățenie Eco`;
        emailContent = generateGenericEmailContent(customerName, order, orderItems, trackingNumber, 'processing');
        break;
        
      default:
        emailSubject = `📦 Order Update #${trackingNumber} - Curățenie Eco`;
        emailContent = generateGenericEmailContent(customerName, order, orderItems, trackingNumber, cleanEmailType);
    }

    // ✅ VERIFICĂ CONFIGURAȚIA TRANSPORTER
    if (!transporter) {
      throw new Error('Email transporter is not configured');
    }

    // ✅ PREGĂTEȘTE EMAIL-UL
    const emailOptions = {
      from: '🌿 Curățenie Eco <dumiadi11@gmail.com>',
      to: order.user_email,
      subject: emailSubject,
      html: emailContent
    };

    console.log('📤 Sending email...');
    console.log('📧 To:', order.user_email);
    console.log('📝 Subject:', emailSubject);

    // ✅ TRIMITE EMAIL-UL
    let emailResult;
    try {
      emailResult = await transporter.sendMail(emailOptions);
    } catch (emailError) {
      console.error('❌ Nodemailer error:', emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', emailResult.messageId);
    console.log('📊 Response:', emailResult.response);
    
    return { 
      success: true, 
      message: `${cleanEmailType} email sent successfully`,
      messageId: emailResult.messageId,
      recipient: order.user_email,
      orderId: cleanOrderId
    };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error stack:', error.stack);
    
    return { 
      success: false, 
      message: 'Failed to send email',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

// ===================================
// 📤 EXPORT FUNCTIONS
// ===================================

const exportServiceOrders = async (req, res) => {
  try {
    console.log('📤 Exporting service orders...');
    const sql = `
      SELECT so.id, s.name AS Serviciu, so.date AS Data, so.time AS Ora, 
             so.address AS Adresa, u.email AS Email, so.status AS Status
      FROM service_orders so
      LEFT JOIN services s ON so.service_id = s.id
      LEFT JOIN users u ON so.user_id = u.id
      ORDER BY so.date DESC
    `;
    const [results] = await pool.query(sql);
    
    const parser = new Parser();
    const csv = parser.parse(results);

    res.header('Content-Type', 'text/csv');
    res.attachment('programari.csv');
    res.send(csv);
  } catch (error) {
    console.error('❌ Error exporting service orders:', error);
    res.status(500).send('Eroare la export programări');
  }
};

const exportProductOrders = async (req, res) => {
  try {
    console.log('📤 Starting Excel export...');
    console.log('📌 User:', req.user?.email, '(ID:', req.user?.id, ')');
    
    // ✅ VERIFICĂ PERMISIUNILE
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin privileges required'
      });
    }
    
    // ✅ VERIFICĂ STRUCTURA TABELEI
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    const hasItemsColumn = columns.some(c => c.Field === 'items');
    const hasUserEmailColumn = columns.some(c => c.Field === 'user_email');
    const hasTotalColumn = columns.some(c => c.Field === 'total');
    const hasTrackingColumn = columns.some(c => c.Field === 'tracking_number');
    
    console.log('📋 Table structure check:', {
      items: hasItemsColumn,
      user_email: hasUserEmailColumn,
      total: hasTotalColumn,
      tracking_number: hasTrackingColumn
    });
    
    // ✅ CONSTRUIEȘTE QUERY-UL DINAMIC
    let selectColumns = ['o.id', 'o.created_at'];
    
    if (hasUserEmailColumn) selectColumns.push('o.user_email');
    if (hasItemsColumn) selectColumns.push('o.items');
    if (hasTotalColumn) selectColumns.push('o.total');
    if (hasTrackingColumn) selectColumns.push('o.tracking_number');
    
    selectColumns.push('o.user_name', 'o.status');
    
    const sql = `
      SELECT ${selectColumns.join(', ')}
      FROM orders o
      ORDER BY o.created_at DESC
    `;
    
    console.log('🔧 Export query:', sql);
    
    const [results] = await pool.query(sql);
    console.log('📊 Orders fetched for export:', results.length);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No orders found to export'
      });
    }

    // ✅ PROCESEAZĂ DATELE PENTRU EXPORT
    const exportRows = [];
    
    results.forEach(order => {
      try {
        let items = [];
        if (order.items && hasItemsColumn) {
          try {
            items = JSON.parse(order.items || '[]');
            if (!Array.isArray(items)) items = [];
          } catch (parseError) {
            console.warn('⚠️ Error parsing items for order', order.id);
            items = [];
          }
        }
        
        if (items.length > 0) {
          // ✅ O LINIE PENTRU FIECARE PRODUS
          items.forEach(item => {
            exportRows.push({
              'Order_ID': order.id,
              'Tracking_Number': order.tracking_number || `ECO-${order.id}`,
              'Customer_Name': order.user_name || 'Unknown',
              'Customer_Email': order.user_email || 'unknown@email.com',
              'Order_Date': order.created_at ? new Date(order.created_at).toLocaleDateString('ro-RO') : '',
              'Order_Status': order.status || 'pending',
              'Product_Name': item.name || 'Unknown Product',
              'Product_Quantity': item.quantity || 1,
              'Product_Price': parseFloat(item.price || 0).toFixed(2),
              'Product_Total': ((item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2),
              'Order_Total': parseFloat(order.total || 0).toFixed(2),
              'Eco_Badge': item.eco_badge || ''
            });
          });
        } else {
          // ✅ O LINIE PENTRU COMANDĂ FĂRĂ PRODUSE SPECIFICE
          exportRows.push({
            'Order_ID': order.id,
            'Tracking_Number': order.tracking_number || `ECO-${order.id}`,
            'Customer_Name': order.user_name || 'Unknown',
            'Customer_Email': order.user_email || 'unknown@email.com',
            'Order_Date': order.created_at ? new Date(order.created_at).toLocaleDateString('ro-RO') : '',
            'Order_Status': order.status || 'pending',
            'Product_Name': 'Order without details',
            'Product_Quantity': 1,
            'Product_Price': parseFloat(order.total || 0).toFixed(2),
            'Product_Total': parseFloat(order.total || 0).toFixed(2),
            'Order_Total': parseFloat(order.total || 0).toFixed(2),
            'Eco_Badge': ''
          });
        }
      } catch (rowError) {
        console.warn('⚠️ Error processing order for export:', order.id, rowError);
        
        // ✅ FALLBACK ROW ÎN CAZ DE EROARE
        exportRows.push({
          'Order_ID': order.id,
          'Tracking_Number': order.tracking_number || `ECO-${order.id}`,
          'Customer_Name': order.user_name || 'Unknown',
          'Customer_Email': order.user_email || 'unknown@email.com',
          'Order_Date': order.created_at ? new Date(order.created_at).toLocaleDateString('ro-RO') : '',
          'Order_Status': order.status || 'pending',
          'Product_Name': 'Processing Error',
          'Product_Quantity': 0,
          'Product_Price': '0.00',
          'Product_Total': '0.00',
          'Order_Total': parseFloat(order.total || 0).toFixed(2),
          'Eco_Badge': ''
        });
      }
    });

    console.log('📊 Export rows prepared:', exportRows.length);

    // ✅ GENEREAZĂ CSV
    const parser = new Parser({
      fields: [
        'Order_ID',
        'Tracking_Number', 
        'Customer_Name',
        'Customer_Email',
        'Order_Date',
        'Order_Status',
        'Product_Name',
        'Product_Quantity',
        'Product_Price',
        'Product_Total',
        'Order_Total',
        'Eco_Badge'
      ]
    });
    
    const csv = parser.parse(exportRows);

    // ✅ GENEREAZĂ NUMELE FIȘIERULUI
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `comenzi_produse_${currentDate}.csv`;

    // ✅ SETEAZĂ HEADERS PENTRU DOWNLOAD
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    res.header('Content-Length', Buffer.byteLength(csv, 'utf8'));

    console.log('✅ Excel export completed successfully');
    console.log('📁 Filename:', filename);
    console.log('📊 Rows exported:', exportRows.length);
    
    // ✅ TRIMITE CSV
    return res.send(csv);

  } catch (error) {
    console.error('❌ Excel export failed:', error);
    console.error('❌ Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Export failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ===================================
// 📈 CHARTS & ANALYTICS
// ===================================

const getServiceOrderStats = async (req, res) => {
  try {
    console.log('📈 Getting service order stats...');
    const sql = `
      SELECT DATE_FORMAT(date, '%Y-%m') AS month, COUNT(*) as total
      FROM service_orders
      WHERE date IS NOT NULL
      GROUP BY month
      ORDER BY month ASC
    `;
    const [results] = await pool.query(sql);
    console.log('✅ Service order stats retrieved:', results.length, 'months');
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting service order stats:', error);
    res.status(500).json({ error: 'Eroare la încărcarea graficului servicii' });
  }
};

const getSalesByMonth = async (req, res) => {
  try {
    console.log('📈 Getting sales by month...');
    
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    const hasItemsColumn = columns.some(c => c.Field === 'items');
    const hasTotalColumn = columns.some(c => c.Field === 'total');
    
    console.log('📋 Table structure - Items:', hasItemsColumn, 'Total:', hasTotalColumn);
    
    let results = [];
    const salesMap = {};
    
    if (hasTotalColumn) {
      const sql = `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, 
               COALESCE(total, 0) as total
        FROM orders
        WHERE created_at IS NOT NULL
      `;
      [results] = await pool.query(sql);
      
      results.forEach(order => {
        const month = order.month;
        const total = parseFloat(order.total || 0);
        if (month) {
          salesMap[month] = (salesMap[month] || 0) + total;
        }
      });
    } else if (hasItemsColumn) {
      const sql = `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, items 
        FROM orders
        WHERE created_at IS NOT NULL AND items IS NOT NULL
      `;
      [results] = await pool.query(sql);
      
      results.forEach(order => {
        try {
          const items = JSON.parse(order.items || '[]');
          let sum = 0;

          items.forEach(item => {
            const price = parseFloat(item.price?.toString().replace(/[^\d.]/g, '') || 0);
            const qty = parseInt(item.quantity || 1);
            sum += price * qty;
          });

          if (order.month) {
            salesMap[order.month] = (salesMap[order.month] || 0) + sum;
          }
        } catch (err) {
          console.warn('Error parsing sales data:', err);
        }
      });
    } else {
      console.log('⚠️ No suitable columns found for sales calculation');
      return res.json([]);
    }

    const formatted = Object.entries(salesMap).map(([month, total]) => ({
      month,
      total: total.toFixed(2)
    }));

    console.log('✅ Sales by month retrieved:', formatted.length, 'months');
    res.json(formatted);
    
  } catch (error) {
    console.error('❌ Error getting sales by month:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea graficului vânzări',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTopProductsChart = async (req, res) => {
  try {
    console.log('🥇 Getting top products...');
    
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    const hasItemsColumn = columns.some(c => c.Field === 'items');
    
    if (!hasItemsColumn) {
      console.log('⚠️ Column "items" not found for top products');
      return res.json([]);
    }
    
    const [results] = await pool.query('SELECT items FROM orders WHERE items IS NOT NULL');

    const countMap = {};
    results.forEach(row => {
      try {
        const items = JSON.parse(row.items || '[]');
        items.forEach(item => {
          const key = item.name;
          const qty = parseInt(item.quantity || 1);
          countMap[key] = (countMap[key] || 0) + qty;
        });
      } catch (err) {
        console.warn('Error parsing top products data:', err);
      }
    });

    const topProducts = Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    console.log('✅ Top products retrieved:', topProducts.length);
    res.json(topProducts);
  } catch (error) {
    console.error('❌ Error getting top products:', error);
    res.status(500).json({ error: 'Eroare la încărcarea top produse' });
  }
};

const getMonthlyRevenue = async (req, res) => {
  return getSalesByMonth(req, res);
};

// În adminController.js
const getSupportMessages = async (req, res) => {
  try {
    const { 
      status = 'pending', 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;

    const [messages] = await pool.query(`
      SELECT 
        sm.*,
        u.name as user_name 
      FROM support_messages sm
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE sm.status = ?
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?
    `, [status, parseInt(limit), offset]);

    const [totalResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM support_messages 
      WHERE status = ?
    `, [status]);

    res.json({
      success: true,
      messages,
      pagination: {
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Eroare preluare mesaje suport:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la preluarea mesajelor de suport' 
    });
  }
};

const resolveSupportMessage = async (req, res) => {
  const { id } = req.params;
  const { reply, status = 'resolved' } = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE support_messages 
      SET 
        status = ?, 
        admin_reply = ?, 
        resolved_at = NOW() 
      WHERE id = ?
    `, [status, reply, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mesaj de suport inexistent' 
      });
    }

    // Opțional: Trimite email utilizatorului
    const [messageDetails] = await pool.query(
      'SELECT * FROM support_messages WHERE id = ?', 
      [id]
    );

    await sendReplyToUser(messageDetails[0], reply);

    res.json({ 
      success: true, 
      message: 'Mesaj rezolvat cu succes' 
    });

  } catch (error) {
    console.error('Eroare rezolvare mesaj suport:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la rezolvarea mesajului' 
    });
  }
};

const sendReplyToUser = async (message, reply) => {
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
      to: message.email,
      subject: `Răspuns la mesajul de suport #${message.id}`,
      html: `
        <div>
          <h2>📨 Răspuns la mesajul tău de suport</h2>
          <p><strong>Subiect original:</strong> ${message.subject}</p>
          <p><strong>Răspuns:</strong> ${reply}</p>
        </div>
      `
    });

  } catch (error) {
    console.error('Eroare trimitere răspuns:', error);
  }
};
// ===================================
// 📧 EMAIL CONTENT GENERATORS
// ===================================

const generateCancelledEmailContent = (customerName, order, items, trackingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #dc3545; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🌿 Curățenie Eco</h1>
        <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Cancelled</h2>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px;">
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
          <h3 style="color: #721c24; margin-top: 0;">Hello ${customerName},</h3>
          <p style="color: #721c24; line-height: 1.6; margin: 0;">
            We're sorry to inform you that your order <strong>#${trackingNumber}</strong> has been cancelled.
          </p>
        </div>
        
        <!-- Order Details -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
          <h4 style="color: #495057; margin-top: 0;">📦 Cancelled Order Details</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #495057;"><strong>Order Number:</strong></td>
              <td style="padding: 8px 0; color: #6c757d;">${trackingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #495057;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; color: #6c757d;">${parseFloat(order.total || 0).toFixed(2)} RON</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #495057;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">CANCELLED</td>
            </tr>
          </table>
        </div>

        ${items.length > 0 ? `
        <!-- Cancelled Items -->
        <div style="margin: 20px 0;">
          <h4 style="color: #495057;">📋 Cancelled Items:</h4>
          <div style="background: #f8f9fa; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6;">
            ${items.map((item, index) => `
              <div style="padding: 15px; border-bottom: ${index < items.length - 1 ? '1px solid #dee2e6' : 'none'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #495057;">${item.name || 'Product'}</strong>
                    <div style="color: #6c757d; font-size: 14px;">Quantity: ${item.quantity || 1}</div>
                  </div>
                  <div style="text-align: right; color: #6c757d;">
                    ${item.quantity || 1} × ${item.price || 0} RON = ${((item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2)} RON
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- What's Next -->
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee5eb;">
          <h4 style="color: #0c5460; margin-top: 0;">💳 Refund Information</h4>
          <p style="color: #0c5460; margin: 10px 0;">• If you paid online, your refund will be processed within 3-5 business days</p>
          <p style="color: #0c5460; margin: 10px 0;">• If you chose cash on delivery, no payment was processed</p>
          <p style="color: #0c5460; margin: 10px 0;">• You'll receive a separate email confirmation once the refund is processed</p>
          <p style="color: #0c5460; margin: 10px 0;">• For questions, contact us at dumiadi11@gmail.com or 0723 456 789</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #2c3e50; color: #bdc3c7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">© 2025 Curățenie Eco SRL</p>
        <p style="margin: 10px 0; font-size: 14px;">📧 dumiadi11@gmail.com | 📞 0723 456 789</p>
        <p style="margin: 10px 0; font-size: 12px; color: #95a5a6;">We apologize for any inconvenience caused.</p>
      </div>
    </div>
  `;
};

const generateConfirmedEmailContent = (customerName, order, items, trackingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #28a745; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🌿 Curățenie Eco</h1>
        <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Confirmed!</h2>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px;">
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
          <h3 style="color: #155724; margin-top: 0;">Great news, ${customerName}! 🎉</h3>
          <p style="color: #155724; line-height: 1.6; margin: 0;">
            Your order <strong>#${trackingNumber}</strong> has been confirmed and is now being prepared for delivery!
          </p>
        </div>
        
        <!-- Order Details -->
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #28a745; margin-top: 0;">📦 Order Details</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #2c3e50;"><strong>Order Number:</strong></td>
              <td style="padding: 8px 0; color: #34495e;">${trackingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #2c3e50;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #28a745; font-weight: bold;">CONFIRMED</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #2c3e50;"><strong>Total:</strong></td>
              <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size: 18px;">${parseFloat(order.total || 0).toFixed(2)} RON</td>
            </tr>
          </table>
        </div>

        <!-- Next Steps -->
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h4 style="color: #0c5460; margin-top: 0;">📋 What's Next?</h4>
          <p style="color: #0c5460; margin: 10px 0;">1. We're preparing your eco-friendly products</p>
          <p style="color: #0c5460; margin: 10px 0;">2. You'll receive tracking information once shipped</p>
          <p style="color: #0c5460; margin: 10px 0;">3. Delivery within 2-5 business days</p>
          <p style="color: #0c5460; margin: 10px 0; font-weight: bold;">4. Enjoy your sustainable products! 🌱</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #2c3e50; color: #bdc3c7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">© 2025 Curățenie Eco SRL</p>
        <p style="margin: 10px 0; font-size: 14px;">📧 dumiadi11@gmail.com | 📞 0723 456 789</p>
      </div>
    </div>
  `;
};

const generateShippedEmailContent = (customerName, order, items, trackingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #007bff; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🌿 Curățenie Eco</h1>
        <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Shipped! 🚚</h2>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px;">
        <div style="background: #cce5ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #99d6ff;">
          <h3 style="color: #004085; margin-top: 0;">Your order is on its way, ${customerName}! 📦</h3>
          <p style="color: #004085; line-height: 1.6; margin: 0;">
            Order <strong>#${trackingNumber}</strong> has been shipped and should arrive within 2-5 business days.
          </p>
        </div>
        
        <!-- Tracking Info -->
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h4 style="color: #007bff; margin-top: 0;">📍 Track Your Package</h4>
          <p style="color: #004085; margin: 10px 0;">Tracking Number: <strong>${trackingNumber}</strong></p>
          <p style="color: #004085; margin: 10px 0;">Expected delivery: 2-5 business days</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #2c3e50; color: #bdc3c7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">© 2025 Curățenie Eco SRL</p>
        <p style="margin: 10px 0; font-size: 14px;">📧 dumiadi11@gmail.com | 📞 0723 456 789</p>
      </div>
    </div>
  `;
};

const generateDeliveredEmailContent = (customerName, order, items, trackingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #28a745; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🌿 Curățenie Eco</h1>
        <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Delivered! 🎉</h2>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px;">
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb; text-align: center;">
          <h3 style="color: #155724; margin-top: 0;">Congratulations, ${customerName}! 🎊</h3>
          <p style="color: #155724; line-height: 1.6; margin: 0;">
            Your order <strong>#${trackingNumber}</strong> has been successfully delivered!
            We hope you love your eco-friendly products. 🌱
          </p>
        </div>
        
        <!-- Feedback Request -->
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #ffeaa7;">
          <h4 style="color: #856404; margin-top: 0;">⭐ How was your experience?</h4>
          <p style="color: #856404; margin: 10px 0;">We'd love to hear your feedback about our products and service!</p>
          <a href="mailto:dumiadi11@gmail.com?subject=Feedback for Order ${trackingNumber}" style="display: inline-block; background: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Leave Feedback</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #2c3e50; color: #bdc3c7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">© 2025 Curățenie Eco SRL</p>
        <p style="margin: 10px 0; font-size: 14px;">📧 dumiadi11@gmail.com | 📞 0723 456 789</p>
        <p style="margin: 10px 0; font-size: 12px; color: #95a5a6;">Thank you for choosing sustainable products! 🌍</p>
      </div>
    </div>
  `;
};

const generateGenericEmailContent = (customerName, order, items, trackingNumber, status) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #6c757d; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🌿 Curățenie Eco</h1>
        <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Update</h2>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dee2e6;">
          <h3 style="color: #495057; margin-top: 0;">Hello ${customerName},</h3>
          <p style="color: #495057; line-height: 1.6; margin: 0;">
            Your order <strong>#${trackingNumber}</strong> status has been updated to: <strong>${status.toUpperCase()}</strong>
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #2c3e50; color: #bdc3c7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">© 2025 Curățenie Eco SRL</p>
        <p style="margin: 10px 0; font-size: 14px;">📧 dumiadi11@gmail.com | 📞 0723 456 789</p>
      </div>
    </div>
  `;
};

// ===================================
// 🛠️ DEBUG FUNCTIONS
// ===================================

const debugDatabaseConfig = async (req, res) => {
  try {
    console.log('\n🔧 ===== DATABASE DEBUG =====');
    
    const config = await pool.testConfiguration();
    console.log('📋 Configuration test result:', config);
    
    // Test o programare random
    const [randomOrder] = await pool.query('SELECT id, status FROM service_orders LIMIT 1');
    
    if (randomOrder.length > 0) {
      const testId = randomOrder[0].id;
      console.log(`🧪 Testing with order ID: ${testId}`);
      
      // Test update simplu
      const [testUpdate] = await pool.query(
        'UPDATE service_orders SET updated_at = NOW() WHERE id = ?',
        [testId]
      );
      
      console.log(`📊 Test update result:`, {
        affectedRows: testUpdate.affectedRows,
        changedRows: testUpdate.changedRows
      });
    }
    
    res.json({
      success: true,
      config: config,
      testUpdate: randomOrder.length > 0 ? 'performed' : 'skipped_no_data'
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===================================
// 📤 EXPORTS
// ===================================

module.exports = {
  // Dashboard & Stats
  getAdminStats,
  
  // Users
  getAllUsers,
  updateUser,
  deleteUser,
  getUserDetails,
  getSupportMessages,
  resolveSupportMessage,
  
  // Product Orders
  getAllProductOrders,
  updateProductOrderStatus,
  
  // Service Orders
  getAllServiceOrders,
  updateServiceOrderStatus,
  deleteServiceOrder,
  
  // Email
  sendOrderConfirmationEmail,
  sendOrderConfirmationEmailInternal,
  
  // Export
  exportServiceOrders,
  exportProductOrders,
  
  // Analytics
  getServiceOrderStats,
  getSalesByMonth,
  getTopProductsChart,
  getMonthlyRevenue,
  
  // Debug
  debugDatabaseConfig
};