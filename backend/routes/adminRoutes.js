const express = require('express');
const router = express.Router();

// 📦 Importă TOATE funcțiile o singură dată
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
  getMonthlyRevenue
} = require('../controllers/adminController');

// 📊 Statistici & utilizatori
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);

// 🛒 Comenzi produse
router.get('/orders', getAllProductOrders);
router.get('/orders/export', exportProductOrders);
router.get('/orders/top-products', getTopProductsChart);
router.get('/orders/monthly-revenue', getMonthlyRevenue);
router.get('/sales-monthly', getSalesByMonth); // grafic vânzări

// 🧼 Comenzi servicii
router.get('/service-orders', getAllServiceOrders);
router.put('/service-orders/:id', updateServiceOrderStatus);
router.delete('/service-orders/:id', deleteServiceOrder);
router.get('/service-orders/export', exportServiceOrders);
router.get('/service-orders/monthly-chart', getServiceOrderStats);

module.exports = router;
