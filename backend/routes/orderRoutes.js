// routes/orderRoutes.js - Updated with stock management

const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  saveOrder,
  getOrders,
  sendInvoiceEmail,
  updateOrderStatus,
  cancelOrder,
  checkStockAvailability
} = require('../controllers/orderController');

// ✅ RUTE PUBLICE - Comenzi
router.post('/new-order', saveOrder);

// ✅ RUTE ADMIN - Gestionare comenzi
router.get('/', protect, requireAdmin, getOrders);
router.put('/:orderId/status', protect, requireAdmin, updateOrderStatus);
router.delete('/:orderId/cancel', protect, requireAdmin, cancelOrder);

// ✅ RUTE PENTRU UTILIZATORI AUTENTIFICAȚI
router.get('/my-orders', protect, async (req, res) => {
  try {
    const pool = require('../config/db');
    
    const [orders] = await pool.query(`
      SELECT * FROM orders 
      WHERE user_email = ? OR user_id = ?
      ORDER BY created_at DESC
    `, [req.user.email, req.user.id]);
    
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching your orders'
    });
  }
});

// ✅ VERIFICARE STOCK PENTRU PRODUS SPECIFIC
router.get('/check-stock/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.query;
    
    const stockCheck = await checkStockAvailability([{
      id: productId,
      quantity: parseInt(quantity)
    }]);
    
    if (stockCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const result = stockCheck[0];
    
    res.json({
      success: true,
      available: result.available,
      availableStock: result.availableStock,
      requestedQuantity: result.requestedQuantity,
      canOrder: result.available,
      message: result.available ? 
        'Product is available' : 
        result.error
    });
    
  } catch (error) {
    console.error('❌ Error checking stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking product availability'
    });
  }
});

// ✅ VERIFICARE STOCK PENTRU COȘUL DE CUMPĂRĂTURI
router.post('/check-cart-stock', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }
    
    const stockChecks = await checkStockAvailability(items);
    
    const unavailableItems = stockChecks.filter(check => !check.available);
    const allAvailable = unavailableItems.length === 0;
    
    res.json({
      success: true,
      allAvailable: allAvailable,
      stockChecks: stockChecks,
      unavailableItems: unavailableItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        requestedQuantity: item.requestedQuantity,
        availableStock: item.availableStock,
        error: item.error
      })),
      message: allAvailable ? 
        'All items are available' : 
        `${unavailableItems.length} items are not available or have insufficient stock`
    });
    
  } catch (error) {
    console.error('❌ Error checking cart stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking cart availability'
    });
  }
});

// ✅ ANULARE COMANDĂ DE CĂTRE CLIENT
router.patch('/:orderId/cancel', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = require('../config/db');
    
    // Verifică dacă comanda aparține utilizatorului
    const [orders] = await pool.query(`
      SELECT * FROM orders 
      WHERE (id = ? OR tracking_number = ?) 
      AND (user_email = ? OR user_id = ?)
    `, [orderId, orderId, req.user.email, req.user.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }
    
    const order = orders[0];
    
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }
    
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel shipped or delivered order'
      });
    }
    
    // Permite anularea doar în primele 24 ore sau dacă este în pending/confirmed
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const canCancel = orderAge < 24 * 60 * 60 * 1000 || ['pending', 'confirmed'].includes(order.status);
    
    if (!canCancel) {
      return res.status(400).json({
        success: false,
        message: 'Order can only be cancelled within 24 hours or while pending/confirmed'
      });
    }
    
    // Apelează funcția de anulare din controller
    req.params.orderId = order.id; // Asigură-te că folosim ID-ul corect
    await cancelOrder(req, res);
    
  } catch (error) {
    console.error('❌ Error cancelling user order:', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelling order'
    });
  }
});

// ✅ OBȚINE ISTORIC STOCK pentru ADMIN
router.get('/admin/stock-history', protect, requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    
    // Obține toate produsele cu stock-ul actual
    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.stock as current_stock,
        COALESCE(ordered.total_ordered, 0) as total_ordered,
        COALESCE(cancelled.total_cancelled, 0) as total_cancelled
      FROM products p
      LEFT JOIN (
        SELECT 
          JSON_EXTRACT(items, '$[*].id') as product_ids,
          SUM(JSON_EXTRACT(items, '$[*].quantity')) as total_ordered
        FROM orders 
        WHERE status NOT IN ('cancelled')
        GROUP BY JSON_EXTRACT(items, '$[*].id')
      ) ordered ON JSON_CONTAINS(ordered.product_ids, CAST(p.id AS JSON))
      LEFT JOIN (
        SELECT 
          JSON_EXTRACT(items, '$[*].id') as product_ids,
          SUM(JSON_EXTRACT(items, '$[*].quantity')) as total_cancelled
        FROM orders 
        WHERE status = 'cancelled'
        GROUP BY JSON_EXTRACT(items, '$[*].id')
      ) cancelled ON JSON_CONTAINS(cancelled.product_ids, CAST(p.id AS JSON))
      ORDER BY p.name
    `);
    
    res.json({
      success: true,
      stockHistory: products
    });
    
  } catch (error) {
    console.error('❌ Error fetching stock history:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching stock history'
    });
  }
});

// ✅ ACTUALIZARE MANUALĂ STOCK (ADMIN)
router.patch('/admin/products/:productId/stock', protect, requireAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock, reason } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      });
    }
    
    const pool = require('../config/db');
    
    // Verifică dacă produsul există
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const oldStock = products[0].stock;
    
    // Actualizează stock-ul
    const [result] = await pool.query(
      'UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?',
      [stock, productId]
    );
    
    console.log(`📦 Manual stock update: Product ${productId} from ${oldStock} to ${stock} (Reason: ${reason || 'No reason provided'})`);
    
    // Opțional: log schimbarea pentru audit
    try {
      await pool.query(`
        INSERT INTO stock_changes (product_id, old_stock, new_stock, change_type, reason, changed_by, created_at)
        VALUES (?, ?, ?, 'manual', ?, ?, NOW())
      `, [productId, oldStock, stock, reason || 'Manual adjustment', req.user.id]);
    } catch (logError) {
      console.warn('⚠️ Could not log stock change:', logError.message);
    }
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      productId: productId,
      oldStock: oldStock,
      newStock: stock,
      changedBy: req.user.email
    });
    
  } catch (error) {
    console.error('❌ Error updating stock manually:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating product stock'
    });
  }
});

// ✅ ISTORIC PENTRU DEBUGGING
router.get('/debug/recent-orders', protect, requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    
    const [recentOrders] = await pool.query(`
      SELECT 
        id,
        user_name,
        user_email,
        items,
        total,
        status,
        created_at,
        tracking_number
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    res.json({
      success: true,
      recentOrders: recentOrders.map(order => ({
        ...order,
        parsedItems: (() => {
          try {
            return JSON.parse(order.items || '[]');
          } catch {
            return [];
          }
        })()
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fetching recent orders:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching recent orders'
    });
  }
});

// ✅ LEGACY ROUTES (pentru compatibilitate)
router.post('/send-email', sendInvoiceEmail);

module.exports = router;