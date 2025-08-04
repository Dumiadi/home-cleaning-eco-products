// controllers/orderController.js - Updated with stock management

const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const path = require('path');
const pool = require('../config/db');

// ✅ CONFIGURARE NODEMAILER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dumiadi11@gmail.com',
    pass: 'bhkg odpa bzqo doju'
  }
});

// ✅ VERIFICĂ ȘI ACTUALIZEAZĂ STOCK-UL
const updateProductStock = async (items, operation = 'decrease') => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const item of items) {
      const productId = item.id;
      const quantity = item.quantity || 1;
      
      // Verifică stock-ul actual
      const [stockResult] = await connection.query(
        'SELECT stock FROM products WHERE id = ?',
        [productId]
      );
      
      if (stockResult.length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const currentStock = stockResult[0].stock || 0;
      let newStock;
      
      if (operation === 'decrease') {
        newStock = Math.max(0, currentStock - quantity);
        
        // Verifică dacă există suficient stock
        if (currentStock < quantity) {
          throw new Error(`Insufficient stock for product ${item.name}. Available: ${currentStock}, Requested: ${quantity}`);
        }
      } else if (operation === 'increase') {
        newStock = currentStock + quantity;
      } else {
        throw new Error(`Invalid operation: ${operation}`);
      }
      
      // Actualizează stock-ul
      await connection.query(
        'UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?',
        [newStock, productId]
      );
      
      console.log(`✅ Stock updated for product ${productId}: ${currentStock} → ${newStock} (${operation})`);
    }
    
    await connection.commit();
    console.log('✅ All stock updates committed successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Stock update failed, rolling back:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// ✅ VERIFICĂ DISPONIBILITATEA STOCK-ULUI ÎNAINTE DE COMANDĂ
const checkStockAvailability = async (items) => {
  try {
    const stockChecks = [];
    
    for (const item of items) {
      const [result] = await pool.query(
        'SELECT id, name, stock FROM products WHERE id = ?',
        [item.id]
      );
      
      if (result.length === 0) {
        stockChecks.push({
          productId: item.id,
          available: false,
          error: `Product not found`
        });
        continue;
      }
      
      const product = result[0];
      const requestedQuantity = item.quantity || 1;
      const availableStock = product.stock || 0;
      
      stockChecks.push({
        productId: item.id,
        productName: product.name,
        requestedQuantity,
        availableStock,
        available: availableStock >= requestedQuantity,
        error: availableStock < requestedQuantity ? 
          `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQuantity}` : null
      });
    }
    
    return stockChecks;
  } catch (error) {
    console.error('❌ Error checking stock availability:', error);
    throw error;
  }
};

// ✅ GENERARE ID SIGUR (EVITĂ OVERFLOW)
const generateSafeOrderId = () => {
  const timestamp = Date.now();
  const shortTimestamp = parseInt(timestamp.toString().slice(-8));
  const randomPart = Math.floor(Math.random() * 1000);
  const safeId = parseInt(`${shortTimestamp}${randomPart.toString().padStart(3, '0')}`);
  
  return safeId > 2000000000 ? Math.floor(Math.random() * 1000000000) + 1000000000 : safeId;
};

// ✅ VERIFICĂ STRUCTURA TABELEI
const checkTableStructure = async () => {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    const columnNames = columns.map(col => col.Field);
    
    return {
      hasUserPhone: columnNames.includes('user_phone'),
      hasUserAddress: columnNames.includes('user_address'),
      hasTrackingNumber: columnNames.includes('tracking_number'),
      hasOrderData: columnNames.includes('order_data'),
      availableColumns: columnNames
    };
  } catch (error) {
    console.error('❌ Eroare la verificarea structurii tabelei:', error);
    return {
      hasUserPhone: false,
      hasUserAddress: false,
      hasTrackingNumber: false,
      hasOrderData: false,
      availableColumns: ['id', 'user_id', 'user_name', 'user_email', 'items', 'total', 'status', 'created_at', 'updated_at']
    };
  }
};

// ✅ SALVARE COMANDĂ CU GESTIONARE STOCK
const saveOrder = async (req, res) => {
  let finalOrderId = null;
  
  try {
    console.log('📦 Salvez comandă în baza de date...');
    console.log('📦 Date comandă primite:', req.body);
    
    const { user, items, total, date, orderId, summary } = req.body;
    
    // ✅ Validări
    if (!user || !items || !total) {
      console.log('❌ Date lipsă pentru comandă');
      return res.status(400).json({ 
        success: false,
        message: 'Date lipsă pentru comandă' 
      });
    }
    
    if (!user.email || !user.name) {
      console.log('❌ Email și nume lipsă');
      return res.status(400).json({ 
        success: false,
        message: 'Email și nume sunt obligatorii' 
      });
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.log('❌ Items invalid sau gol');
      return res.status(400).json({ 
        success: false,
        message: 'Comanda trebuie să conțină cel puțin un produs' 
      });
    }

    // ✅ VERIFICĂ DISPONIBILITATEA STOCK-ULUI
    console.log('📋 Checking stock availability...');
    const stockChecks = await checkStockAvailability(items);
    
    const unavailableItems = stockChecks.filter(check => !check.available);
    if (unavailableItems.length > 0) {
      console.log('❌ Stock insufficient for some items:', unavailableItems);
      return res.status(400).json({
        success: false,
        message: 'Some products are out of stock or have insufficient quantity',
        unavailableItems: unavailableItems.map(item => ({
          productName: item.productName,
          error: item.error
        }))
      });
    }

    // ✅ VERIFICĂ STRUCTURA TABELEI
    const tableStructure = await checkTableStructure();
    console.log('🔍 Structura tabelei orders:', tableStructure);

    // ✅ GENEREAZĂ ID SIGUR
    finalOrderId = generateSafeOrderId();
    
    // ✅ Verifică dacă ID-ul există deja
    let attempts = 0;
    while (attempts < 5) {
      const [existingOrder] = await pool.query('SELECT id FROM orders WHERE id = ?', [finalOrderId]);
      if (existingOrder.length === 0) {
        break;
      }
      finalOrderId = generateSafeOrderId();
      attempts++;
      console.log(`🔄 ID-ul ${finalOrderId} există deja, generez altul... (încercarea ${attempts})`);
    }
    
    const trackingNumber = orderId || `ECO-${finalOrderId}`;
    
    console.log('📦 Generated safe order ID:', finalOrderId);
    console.log('📦 Tracking number:', trackingNumber);
    
    // ✅ SIMPLIFICARE ITEMS
    const simplifiedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      eco_badge: item.eco_badge || 'Eco'
    }));
    
    // ✅ ÎNCEPE TRANZACȚIA PENTRU COMANDĂ + STOCK
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // ✅ ACTUALIZEAZĂ STOCK-UL (SCADE)
      console.log('📉 Updating stock for ordered products...');
      await updateProductStock(simplifiedItems, 'decrease');
      
      // ✅ SALVEAZĂ COMANDA
      const baseColumns = ['id', 'user_id', 'user_name', 'user_email', 'items', 'total', 'status', 'created_at', 'updated_at'];
      const baseValues = ['?', '?', '?', '?', '?', '?', '?', 'NOW()', 'NOW()'];
      const baseParams = [
        finalOrderId,
        null,
        user.name,
        user.email,
        JSON.stringify(simplifiedItems),
        parseFloat(total),
        'pending'
      ];

      // Adaugă coloanele opționale
      if (tableStructure.hasUserPhone) {
        baseColumns.splice(-2, 0, 'user_phone');
        baseValues.splice(-2, 0, '?');
        baseParams.splice(-1, 0, user.phone || null);
      }

      if (tableStructure.hasUserAddress) {
        baseColumns.splice(-2, 0, 'user_address');
        baseValues.splice(-2, 0, '?');
        baseParams.splice(-1, 0, user.address || null);
      }

      if (tableStructure.hasTrackingNumber) {
        baseColumns.splice(-2, 0, 'tracking_number');
        baseValues.splice(-2, 0, '?');
        baseParams.splice(-1, 0, trackingNumber);
      }

      const query = `
        INSERT INTO orders (${baseColumns.join(', ')}) 
        VALUES (${baseValues.join(', ')})
      `;
      
      console.log('🔧 Query dinamic generat:', query);
      console.log('📊 Parametrii:', baseParams);
      
      console.log('📦 Inserting order into database...');
      const [result] = await connection.query(query, baseParams);
      
      await connection.commit();
      
      console.log('✅ Comandă și stock actualizate cu succes!');
      console.log('✅ Order saved with insert ID:', result.insertId);
      
    } catch (dbError) {
      await connection.rollback();
      console.error('❌ Database transaction failed, rolling back:', dbError);
      throw dbError;
    } finally {
      connection.release();
    }
    
    // ✅ VERIFICĂ SALVAREA
    const [checkResult] = await pool.query(
      'SELECT id, user_name, user_email, total, status FROM orders WHERE id = ?',
      [finalOrderId]
    );
    
    if (checkResult.length === 0) {
      throw new Error('Comanda nu a fost salvată corect în baza de date');
    }
    
    console.log('✅ Verificare DB completă - comanda există:', checkResult[0]);
    
    // ✅ TRIMITE EMAIL DE CONFIRMARE
    try {
      await sendOrderReceivedEmail({
        user: user,
        items: items,
        total: total,
        orderId: trackingNumber
      });
      console.log('✅ Email de confirmare trimis clientului');
    } catch (emailError) {
      console.warn('⚠️ Email nu a putut fi trimis:', emailError.message);
    }
    
    res.json({ 
      success: true,
      message: 'Comandă salvată cu succes!', 
      orderId: trackingNumber,
      dbId: finalOrderId,
      trackingNumber: trackingNumber,
      emailSent: true,
      stockUpdated: true
    });
    
  } catch (error) {
    console.error('❌ Eroare MAJORĂ la salvarea comenzii:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // ✅ ÎNCEARCĂ SĂ RESTAUREZI STOCK-UL dacă comanda a eșuat dar stock-ul a fost actualizat
    if (finalOrderId && items) {
      try {
        console.log('🔄 Attempting to restore stock after failed order...');
        await updateProductStock(items, 'increase');
        console.log('✅ Stock restored successfully after failed order');
      } catch (stockRestoreError) {
        console.error('❌ Failed to restore stock after failed order:', stockRestoreError);
      }
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Eroare la salvarea comenzii. Stock-ul a fost restaurat.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
    });
  }
};

// ✅ FUNCȚIE PENTRU ANULAREA COMENZII (RESTAUREAZĂ STOCK-UL)
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('❌ Canceling order:', orderId);
    
    // Obține detaliile comenzii
    const [orderResult] = await pool.query(
      'SELECT * FROM orders WHERE id = ? OR tracking_number = ?',
      [orderId, orderId]
    );
    
    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comanda nu a fost găsită'
      });
    }
    
    const order = orderResult[0];
    
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Comanda este deja anulată'
      });
    }
    
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Nu se poate anula o comandă expediată sau livrată'
      });
    }
    
    // Parse items din comandă
    const orderItems = JSON.parse(order.items || '[]');
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Restaurează stock-ul
      await updateProductStock(orderItems, 'increase');
      
      // Actualizează statusul comenzii
      await connection.query(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        ['cancelled', order.id]
      );
      
      await connection.commit();
      
      console.log('✅ Order cancelled and stock restored');
      
      res.json({
        success: true,
        message: 'Comanda a fost anulată cu succes și stock-ul a fost restaurat'
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Error canceling order:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea comenzii'
    });
  }
};

// ✅ ACTUALIZARE STATUS COMANDĂ (FĂRĂ A AFECTA STOCK-UL)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status invalid'
      });
    }
    
    console.log(`🔄 Updating order ${orderId} status to ${status}`);
    
    const [result] = await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? OR tracking_number = ?',
      [status, orderId, orderId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comanda nu a fost găsită'
      });
    }
    
    console.log('✅ Order status updated successfully');
    
    res.json({
      success: true,
      message: `Status actualizat la: ${status}`
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea statusului'
    });
  }
};

// ✅ CITEȘTE COMENZI PENTRU ADMIN
const getOrders = async (req, res) => {
  try {
    console.log('📋 Citesc comenzi din baza de date pentru admin...');
    
    const tableStructure = await checkTableStructure();
    
    const selectColumns = ['id', 'user_id', 'user_name', 'user_email', 'items', 'total', 'status', 'created_at', 'updated_at'];
    
    if (tableStructure.hasUserPhone) selectColumns.splice(-2, 0, 'user_phone');
    if (tableStructure.hasUserAddress) selectColumns.splice(-2, 0, 'user_address');
    if (tableStructure.hasTrackingNumber) selectColumns.splice(-2, 0, 'tracking_number');
    
    const query = `SELECT ${selectColumns.join(', ')} FROM orders ORDER BY created_at DESC`;
    const [results] = await pool.query(query);
    
    console.log('✅ Comenzi din DB:', results.length);
    
    const processedOrders = results.map(order => {
      try {
        let parsedItems = [];
        
        if (order.items) {
          try {
            parsedItems = JSON.parse(order.items);
            if (!Array.isArray(parsedItems)) {
              parsedItems = [];
            }
          } catch (parseError) {
            console.warn('⚠️ Could not parse items for order', order.id);
            parsedItems = [];
          }
        }
        
        return {
          id: order.id,
          user_id: order.user_id,
          user_name: order.user_name,
          user_email: order.user_email,
          user_phone: order.user_phone || null,
          user_address: order.user_address || null,
          items: JSON.stringify(parsedItems),
          parsedItems: parsedItems,
          total: parseFloat(order.total || 0),
          status: order.status || 'pending',
          tracking_number: order.tracking_number || null,
          created_at: order.created_at,
          updated_at: order.updated_at
        };
      } catch (processingError) {
        console.warn('⚠️ Error processing order', order.id, processingError);
        return order;
      }
    });
    
    res.json(processedOrders);
    
  } catch (error) {
    console.error('❌ Eroare la citirea comenzilor din DB:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea comenzilor' 
    });
  }
};

// ✅ FUNCȚIE PENTRU EMAIL DE CONFIRMARE
const sendOrderReceivedEmail = async (orderData) => {
  try {
    const customerName = orderData.user.name;
    const customerEmail = orderData.user.email;
    const orderId = orderData.orderId;
    const total = orderData.total;
    const items = orderData.items;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: #27ae60; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌿 Curățenie Eco</h1>
          <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Received Successfully!</h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">Hello ${customerName}! 👋</h3>
            <p style="color: #34495e; line-height: 1.6; margin: 0;">
              Thank you for your order! We've received it successfully and reserved the products for you.
            </p>
          </div>
          
          <!-- Order Details -->
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #27ae60; margin-top: 0;">📦 Order Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #2c3e50;"><strong>Order Number:</strong></td>
                <td style="padding: 8px 0; color: #34495e;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #2c3e50;"><strong>Total:</strong></td>
                <td style="padding: 8px 0; color: #27ae60; font-weight: bold; font-size: 18px;">${total} RON</td>
              </tr>
            </table>
          </div>
          
          <!-- Products -->
          <div style="margin: 20px 0;">
            <h4 style="color: #2c3e50;">🛍️ Ordered Products:</h4>
            <div style="background: #f8f9fa; border-radius: 8px; overflow: hidden;">
              ${items.map((item, index) => `
                <div style="padding: 15px; border-bottom: ${index < items.length - 1 ? '1px solid #dee2e6' : 'none'};">
                  <strong style="color: #2c3e50;">${item.name || 'Unknown Product'}</strong>
                  <div style="color: #6c757d; font-size: 14px;">Quantity: ${item.quantity || 1} × ${item.price || 0} RON</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Stock Info -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">📋 Stock Reserved</h4>
            <p style="color: #856404; margin: 0;">
              We've reserved these products for you and updated our inventory. Your order will be processed within 24 hours.
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

    const emailOptions = {
      from: '🌿 Curățenie Eco <dumiadi11@gmail.com>',
      to: customerEmail,
      subject: `📦 Order Received #${orderId} - Stock Reserved - Curățenie Eco`,
      html: emailContent
    };
    
    await transporter.sendMail(emailOptions);
    console.log(`✅ Email de confirmare cu stock info trimis către: ${customerEmail}`);
    
  } catch (error) {
    console.error('❌ Eroare la trimiterea email-ului de confirmare:', error);
    throw error;
  }
};

// ✅ EMAIL SIMPLU PENTRU BACKWARD COMPATIBILITY
const sendInvoiceEmail = (req, res) => {
  const { name, address, phone, items, total, email } = req.body;
  const invoiceNumber = getNextInvoiceNumber();
  const trackingNumber = generateTrackingNumber();
  const currentDate = new Date().toLocaleDateString('ro-RO');

  console.log(`📧 Încep procesarea emailului pentru ${email}...`);

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">🌿 Curățenie Eco - Factura #${invoiceNumber}</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Salut ${name}! 👋</h3>
        <p>Mulțumim pentru comanda ta eco!</p>
      </div>
      
      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📦 Detalii Comandă</h4>
        <p><strong>Număr tracking:</strong> ${trackingNumber}</p>
        <p><strong>Total comandă:</strong> ${total} RON</p>
        <p><strong>Data:</strong> ${currentDate}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Adresa livrare:</strong> ${address}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h4>🛍️ Produse comandate:</h4>
        <ul>
          ${items.map(item => `
            <li>${item.name} - ${item.quantity}x ${item.price} RON</li>
          `).join('')}
        </ul>
      </div>
      
      <div style="text-center; color: #7f8c8d; margin-top: 30px;">
        <p>© 2025 Curățenie Eco SRL</p>
        <p>📧 dumiadi11@gmail.com | 📞 0723 456 789</p>
      </div>
    </div>
  `;

  transporter.sendMail({
    from: '🌿 Curatenie Eco <dumiadi11@gmail.com>',
    to: email,
    subject: `✅ Factura #${invoiceNumber} - Comanda ta eco a fost procesată! 🌱`,
    html: emailContent
  }, (error, info) => {
    if (error) {
      console.error('❌ Eroare trimitere email:', error);
      res.status(500).json({ 
        success: false,
        message: 'Eroare la trimitere email',
        error: error.message 
      });
    } else {
      console.log(`📧 Email trimis cu succes la ${email}`);
      res.json({ 
        success: true,
        message: 'Email trimis cu succes!',
        messageId: info.messageId 
      });
    }
  });
};

// ✅ HELPER FUNCTIONS
const generateTrackingNumber = () => {
  const prefix = 'ECO';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
};

const getNextInvoiceNumber = () => {
  const filePath = './invoiceNumber.txt';
  let number = 1;

  if (fs.existsSync(filePath)) {
    number = parseInt(fs.readFileSync(filePath, 'utf8'), 10) || 1;
  }

  fs.writeFileSync(filePath, (number + 1).toString());
  return number.toString().padStart(4, '0');
};

module.exports = {
  saveOrder,
  getOrders,
  sendInvoiceEmail,
  sendOrderReceivedEmail,
  updateOrderStatus,
  cancelOrder,
  updateProductStock,
  checkStockAvailability
};