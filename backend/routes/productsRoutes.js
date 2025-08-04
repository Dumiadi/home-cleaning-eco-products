// const express = require('express');
// const router = express.Router();
// const pool = require('../config/db');

// // 🔍 Listarea tuturor produselor
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM products');
//     res.json(rows);
//   } catch (err) {
//     console.error('❌ Eroare la extragerea produselor:', err);
//     res.status(500).json({ message: 'Eroare la extragerea produselor' });
//   }
// });

// // ➕ Adăugare produs în coș
// router.post('/cart', async (req, res) => {
//   const { productId, quantity = 1 } = req.body;
//   if (!productId) return res.status(400).json({ message: 'ID produs lipsă' });

//   try {
//     await pool.query(
//       `INSERT INTO cart (user_id, product_id, quantity)
//        VALUES (?, ?, ?)
//        ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
//       [req.user?.id || null, productId, quantity, quantity]
//     );
//     res.json({ message: 'Produs adăugat în coș' });
//   } catch (err) {
//     console.error('❌ Eroare la adăugare în coș:', err);
//     res.status(500).json({ message: 'Eroare la adăugare în coș' });
//   }
// });

// module.exports = router;
// routes/productsRoutes.js - VERSIUNEA CARE FUNCȚIONEAZĂ CU BAZA TA DE DATE
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ✅ GET /api/products - ADAPTAT LA STRUCTURA TA EXACTĂ
router.get('/', async (req, res) => {
  try {
    console.log('🛍️ Getting public products...');
    
    // ✅ PRIMUL PAS: Verifică ce coloane există în tabela products
    const [columns] = await pool.query('SHOW COLUMNS FROM products');
    console.log('📋 Available columns in products table:', columns.map(c => c.Field));
    
    // ✅ VERIFICĂ COLOANELE DISPONIBILE
    const availableColumns = columns.map(c => c.Field);
    const hasCategory = availableColumns.includes('category');
    const hasFeaturedImage = availableColumns.includes('featured_image_url');
    const hasStock = availableColumns.includes('stock');
    const hasEcoBadge = availableColumns.includes('eco_badge');
    const hasRating = availableColumns.includes('rating');
    
    console.log('📊 Column availability:', {
      category: hasCategory,
      featured_image_url: hasFeaturedImage,
      stock: hasStock,
      eco_badge: hasEcoBadge,
      rating: hasRating
    });
    
    // ✅ CONSTRUIEȘTE QUERY-UL DINAMIC pe baza coloanelor disponibile
    let selectColumns = [
      'id',
      'name',
      'description',
      'price',
      'created_at'
    ];
    
    // Adaugă coloanele opționale dacă există
    if (hasCategory) selectColumns.push('category');
    if (hasFeaturedImage) selectColumns.push('featured_image_url');
    if (hasStock) selectColumns.push('stock');
    if (hasEcoBadge) selectColumns.push('eco_badge');
    if (hasRating) selectColumns.push('rating');
    if (availableColumns.includes('updated_at')) selectColumns.push('updated_at');
    
    const query = `
      SELECT ${selectColumns.join(', ')}
      FROM products 
      ${hasStock ? 'WHERE (stock > 0 OR stock IS NULL)' : ''}
      ORDER BY created_at DESC
    `;
    
    console.log('🔧 Dynamic query:', query);
    
    const [results] = await pool.query(query);
    console.log('✅ Raw products from DB:', results.length);
    
    // ✅ TRANSFORMĂ DATELE cu valori default pentru coloanele lipsă
    const transformedProducts = results.map(product => ({
      id: product.id,
      name: product.name || 'Produs Eco',
      category: product.category || 'Îngrijire Personală', // Default dacă nu există
      price: parseFloat(product.price) || 0,
      rating: product.rating || 4.5,
      featured_image_url: product.featured_image_url || product.image || 'https://via.placeholder.com/400x300?text=Produs+Eco',
      description: product.description || 'Produs eco sustenabil',
      eco_badge: product.eco_badge || getBadgeForCategory(product.category || 'General'),
      in_stock: hasStock ? (product.stock > 0 || product.stock == null) : true,
      stock: product.stock || 0,
      created_at: product.created_at
    }));
    
    console.log('✅ Transformed products for frontend:', transformedProducts.length);
    res.json(transformedProducts);
    
  } catch (error) {
    console.error('❌ Error getting public products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea produselor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ Helper pentru badge-uri eco
function getBadgeForCategory(category) {
  const categoryBadges = {
    "Îngrijire Personală": "Biodegradabil",
    "Curățenie Casă": "Non-toxic",
    "Acasă și Grădină": "Sustenabil"
  };
  return categoryBadges[category] || "Eco";
}

// ✅ GET /api/products/:id - Produs specific (adaptat și el)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting product details for ID:', id);
    
    // Query simplu pentru produs specific
    const [results] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produsul nu a fost găsit'
      });
    }
    
    const product = results[0];
    
    // Transformă cu valori default
    const transformed = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category || 'General',
      featured_image_url: product.featured_image_url || product.image || 'https://via.placeholder.com/400x300?text=Produs+Eco',
      stock: product.stock || 0,
      eco_badge: product.eco_badge || 'Eco',
      rating: product.rating || 4.5,
      in_stock: product.stock > 0 || product.stock == null || true
    };
    
    res.json(transformed);
    
  } catch (error) {
    console.error('❌ Error getting product details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea detaliilor produsului' 
    });
  }
});

// ✅ RUTĂ DE TEST pentru a vedea structura exactă a tabelei
router.get('/debug/table-structure', async (req, res) => {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM products');
    const [sampleData] = await pool.query('SELECT * FROM products LIMIT 3');
    
    res.json({
      success: true,
      table_structure: columns,
      sample_data: sampleData,
      total_products: sampleData.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;