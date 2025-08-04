// routes/publicRoutes.js - NOU FIȘIER
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ✅ ENDPOINT PUBLIC pentru produse (fără autentificare)
router.get('/products', async (req, res) => {
  try {
    console.log('🛍️ Getting public products...');
    
    // Selectează doar produsele care sunt în stoc și publice
    const [results] = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        category,
        featured_image_url as image,
        stock,
        eco_badge,
        rating,
        created_at
      FROM products 
      WHERE stock > 0 OR stock IS NULL
      ORDER BY created_at DESC
    `);
    
    console.log('✅ Public products retrieved:', results.length);
    res.json(results);
    
  } catch (error) {
    console.error('❌ Error getting public products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea produselor' 
    });
  }
});

// ✅ ENDPOINT PUBLIC pentru servicii (deja existent dar să fie sigur)
router.get('/services', async (req, res) => {
  try {
    console.log('🧽 Getting public services...');
    
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
        reviews_count
      FROM services 
      WHERE is_available = 1 OR is_available IS NULL
      ORDER BY is_popular DESC, created_at DESC
    `);
    
    console.log('✅ Public services retrieved:', results.length);
    res.json(results);
    
  } catch (error) {
    console.error('❌ Error getting public services:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare la încărcarea serviciilor' 
    });
  }
});

module.exports = router;