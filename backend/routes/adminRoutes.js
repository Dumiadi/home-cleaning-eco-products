// routes/adminRoutes.js - COMPLETE UPDATED VERSION
const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// 📦 Importă toate funcțiile din adminController
const {
  getAdminStats,
  getAllUsers,
  getAllProductOrders,
  getAllServiceOrders,
  updateServiceOrderStatus,
  deleteServiceOrder,
  exportServiceOrders,
  exportProductOrders,
  getSalesByMonth,
  getServiceOrderStats,
  getTopProductsChart,
  getMonthlyRevenue,
  updateUser,
  deleteUser,
  getUserDetails,
  debugDatabaseConfig,
  // ✅ FUNCȚII PENTRU COMENZI PRODUSE (COMPLETE)
  updateProductOrderStatus,
  sendOrderConfirmationEmail
} = require('../controllers/adminController');

// ✅ DEBUG MIDDLEWARE pentru toate rutele admin
router.use((req, res, next) => {
  console.log(`\n🔧 ADMIN ROUTE: ${req.method} ${req.originalUrl}`);
  console.log(`📋 Headers:`, {
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body);
  }
  
  next();
});

// ✅ APLICĂ MIDDLEWARE PENTRU TOATE RUTELE ADMIN
router.use(protect);      
router.use(requireAdmin); 

// ✅ MIDDLEWARE pentru verificarea user-ului după autentificare
router.use((req, res, next) => {
  if (req.user) {
    console.log(`👤 Authenticated admin user:`, {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });
  } else {
    console.log(`❌ No user found in request after auth middleware`);
  }
  next();
});

// ============ RUTE DE DEBUG (înaintea rutelor normale) ============
router.get('/debug/database', debugDatabaseConfig);

router.get('/debug/service-order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../config/db');
    
    console.log(`🔍 Debug check for order ${id}`);
    
    const [result] = await pool.query(
      'SELECT id, status, updated_at, created_at FROM service_orders WHERE id = ?',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: result[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============ STATISTICI & UTILIZATORI ============
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);            
router.delete('/users/:id', deleteUser);         

// ============ COMENZI PRODUSE ============
router.get('/orders', getAllProductOrders);
router.get('/orders/export', exportProductOrders);
router.get('/orders/top-products', getTopProductsChart);
router.get('/orders/monthly-revenue', getMonthlyRevenue);
router.get('/sales-monthly', getSalesByMonth);

// ✅ ENDPOINT PENTRU ACTUALIZAREA STATUSULUI COMENZII PRODUSE
router.put('/orders/:id/status', async (req, res, next) => {
  console.log(`\n🛍️ PRODUCT ORDER STATUS UPDATE`);
  console.log(`📌 Order ID: ${req.params.id}`);
  console.log(`📌 New Status: ${req.body.status}`);
  console.log(`📌 User ID: ${req.user?.id}`);
  console.log(`📌 Timestamp: ${new Date().toISOString()}`);
  
  try {
    await updateProductOrderStatus(req, res);
  } catch (error) {
    console.error(`❌ Product order status update error:`, error);
    next(error);
  }
});

// ✅ ENDPOINT PENTRU TRIMITEREA EMAIL-ULUI DE CONFIRMARE
router.post('/orders/:id/send-email', async (req, res, next) => {
  console.log(`\n📧 EMAIL CONFIRMATION REQUEST`);
  console.log(`📌 Order ID: ${req.params.id}`);
  console.log(`📌 Email Type: ${req.body.emailType}`);
  console.log(`📌 User ID: ${req.user?.id}`);
  console.log(`📌 Timestamp: ${new Date().toISOString()}`);
  
  try {
    await sendOrderConfirmationEmail(req, res);
  } catch (error) {
    console.error(`❌ Email sending error:`, error);
    next(error);
  }
});

// ============ COMENZI SERVICII ============
router.get('/service-orders', getAllServiceOrders);

// ✅ RUTA PENTRU UPDATE STATUS CU DEBUG SUPLIMENTAR
router.put('/service-orders/:id', async (req, res, next) => {
  console.log(`\n🎯 SERVICE ORDER STATUS UPDATE`);
  console.log(`📌 Order ID: ${req.params.id}`);
  console.log(`📌 New Status: ${req.body.status}`);
  console.log(`📌 User ID: ${req.user?.id}`);
  console.log(`📌 Timestamp: ${new Date().toISOString()}`);
  
  try {
    await updateServiceOrderStatus(req, res);
  } catch (error) {
    console.error(`❌ Service order status update error:`, error);
    next(error);
  }
});

router.delete('/service-orders/:id', deleteServiceOrder);
router.get('/service-orders/export', exportServiceOrders);
router.get('/service-orders/monthly-chart', getServiceOrderStats);

// ✅ RUTA PENTRU VERIFICAREA DIRECTĂ A STATUSULUI
router.get('/service-orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../config/db');
    
    console.log(`🔍 Checking status for order ${id}`);
    
    const [result] = await pool.query(
      'SELECT id, status, updated_at FROM service_orders WHERE id = ?',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Programarea nu a fost găsită'
      });
    }
    
    console.log(`📊 Current status in DB:`, result[0]);
    
    res.json({
      success: true,
      data: result[0]
    });
    
  } catch (error) {
    console.error(`❌ Status check error:`, error);
    res.status(500).json({
      success: false,
      error: 'Eroare la verificarea statusului'
    });
  }
});

// ============ PRODUSE - ADAPTAT LA STRUCTURA EXISTENTĂ ============
router.get('/products', async (req, res) => {
  try {
    console.log('🛍️ Getting all products...');
    const pool = require('../config/db');
    
    // Adaptez query-ul la coloanele existente
    const [results] = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        stock,
        featured_image_url as image,
        created_at,
        updated_at
      FROM products 
      ORDER BY created_at DESC
    `);
    
    console.log('✅ Products retrieved:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea produselor',
      details: error.message 
    });
  }
});

router.post('/products', async (req, res) => {
  try {
    console.log('➕ Adding new product...');
    const pool = require('../config/db');
    const { name, description, price, image } = req.body;
    
    if (!name || !description || !price) {
      return res.status(400).json({ 
        success: false,
        error: 'Nume, descriere și preț sunt obligatorii' 
      });
    }
    
    // Adaptez la coloanele existente
    const [result] = await pool.query(`
      INSERT INTO products (name, description, price, featured_image_url, stock, created_at, updated_at) 
      VALUES (?, ?, ?, ?, 0, NOW(), NOW())
    `, [name, description, parseFloat(price), image || null]);
    
    console.log('✅ Product added with ID:', result.insertId);
    res.json({ 
      success: true, 
      message: 'Produs adăugat cu succes!',
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la adăugarea produsului',
      details: error.message 
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    console.log('✏️ Updating product...');
    const pool = require('../config/db');
    const { id } = req.params;
    const { name, description, price, image } = req.body;
    
    // Adaptez la coloanele existente
    const [result] = await pool.query(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, featured_image_url = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name, description, parseFloat(price), image || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Produsul nu a fost găsit' 
      });
    }
    
    console.log('✅ Product updated');
    res.json({ 
      success: true, 
      message: 'Produs actualizat cu succes!' 
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la actualizarea produsului',
      details: error.message 
    });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting product...');
    const pool = require('../config/db');
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Produsul nu a fost găsit' 
      });
    }
    
    console.log('✅ Product deleted');
    res.json({ 
      success: true, 
      message: 'Produs șters cu succes!' 
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la ștergerea produsului',
      details: error.message 
    });
  }
});

// ============ SERVICII - ADAPTAT LA STRUCTURA EXISTENTĂ ============
router.get('/services', async (req, res) => {
  try {
    console.log('🧽 Getting all services...');
    const pool = require('../config/db');
    
    // Adaptez query-ul la coloanele existente
    const [results] = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        price_unit,
        duration,
        category,
        image_url as image,
        is_available,
        is_popular,
        rating,
        reviews_count,
        bookings_count,
        team_size,
        area_coverage,
        badge,
        features,
        created_at,
        updated_at
      FROM services 
      ORDER BY created_at DESC
    `);
    
    console.log('✅ Services retrieved:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting services:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea serviciilor',
      details: error.message 
    });
  }
});

router.post('/services', async (req, res) => {
  try {
    console.log('➕ Adding new service...');
    const pool = require('../config/db');
    const { name, description, price, duration, category, image } = req.body;
    
    if (!name || !description || !price) {
      return res.status(400).json({ 
        success: false,
        error: 'Nume, descriere și preț sunt obligatorii' 
      });
    }
    
    // Adaptez la coloanele existente
    const [result] = await pool.query(`
      INSERT INTO services (
        name, description, price, duration, category, image_url, 
        is_available, rating, reviews_count, bookings_count, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 0.0, 0, 0, NOW(), NOW())
    `, [
      name, 
      description, 
      parseFloat(price), 
      duration || null, 
      category || null, 
      image || null
    ]);
    
    console.log('✅ Service added with ID:', result.insertId);
    res.json({ 
      success: true, 
      message: 'Serviciu adăugat cu succes!',
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error adding service:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la adăugarea serviciului',
      details: error.message 
    });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    console.log('✏️ Updating service...');
    const pool = require('../config/db');
    const { id } = req.params;
    const { name, description, price, duration, category, image } = req.body;
    
    // Adaptez la coloanele existente
    const [result] = await pool.query(`
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category = ?, 
          image_url = ?, updated_at = NOW() 
      WHERE id = ?
    `, [
      name, 
      description, 
      parseFloat(price), 
      duration || null, 
      category || null, 
      image || null, 
      id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Serviciul nu a fost găsit' 
      });
    }
    
    console.log('✅ Service updated');
    res.json({ 
      success: true, 
      message: 'Serviciu actualizat cu succes!' 
    });
  } catch (error) {
    console.error('❌ Error updating service:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la actualizarea serviciului',
      details: error.message 
    });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting service...');
    const pool = require('../config/db');
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Serviciul nu a fost găsit' 
      });
    }
    
    console.log('✅ Service deleted');
    res.json({ 
      success: true, 
      message: 'Serviciu șters cu succes!' 
    });
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la ștergerea serviciului',
      details: error.message 
    });
  }
});

// ============ TEST ROUTE pentru debugging ============
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admin routes working with existing DB structure!', 
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /admin/stats',
      'GET /admin/orders',
      'PUT /admin/orders/:id/status',
      'POST /admin/orders/:id/send-email',
      'GET /admin/orders/export',
      'GET /admin/service-orders',
      'PUT /admin/service-orders/:id',
      'GET /admin/users',
      'GET /admin/products',
      'GET /admin/services'
    ]
  });
});

// ============ ERROR HANDLER pentru rutele admin ============
router.use((error, req, res, next) => {
  console.error(`❌ Admin Route Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id
  });
  
  res.status(500).json({
    success: false,
    error: 'Eroare server admin',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;