const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminProductServiceController');

// Produse
router.get('/products', ctrl.getAllProducts);
router.post('/products', ctrl.addProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Servicii
router.get('/services', ctrl.getAllServices);
router.post('/services', ctrl.addService);
router.put('/services/:id', ctrl.updateService);
router.delete('/services/:id', ctrl.deleteService);

module.exports = router;
