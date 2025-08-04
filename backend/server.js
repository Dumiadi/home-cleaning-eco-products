const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
require('./config/db');

const app = express();

// 📦 Middleware de bază
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

console.log('\n🧪 DEBUGGING RUTE UNA CÂTE UNA - VERSIUNE MINIMALĂ\n');

// Funcție pentru încărcare sigură
const loadRouteSafely = (routePath, routeName, mountPath) => {
  try {
    console.log(`🔄 Încărcare ${routeName}...`);
    const router = require(routePath);
    
    console.log(`📦 Ruta ${routeName} încărcată în memorie - OK`);
    
    // Încearcă să o monteze pe server
    app.use(mountPath, router);
    console.log(`✅ Ruta ${routeName} montată pe ${mountPath} - OK`);
    
    return true;
  } catch (error) {
    console.log(`❌ EROARE la ${routeName}:`, error.message);
    if (error.message.includes('path-to-regexp') || error.message.includes('Missing parameter')) {
      console.log(`🎯 PROBLEMA GĂSITĂ! Fișierul ${routePath} are o rută cu parametri malformați!`);
      console.log(`🔧 Verifică fișierul: ${routePath}`);
      console.log(`🔍 Caută rute de tipul: router.get('/cale/:param', ...) cu sintaxa greșită`);
      process.exit(1);
    }
    return false;
  }
};

// Test 1 - Cea mai simplă rută
console.log('🧪 Test 1: Rută de test simplă...');
app.get('/test', (req, res) => res.json({ message: 'test ok' }));
console.log('✅ Rută de test - OK');

// Test 2 - User routes
if (loadRouteSafely('./routes/userRoutes', 'User Routes', '/api/users')) {
  console.log('🟢 User routes încărcate cu succes');
} else {
  console.log('🔴 User routes au eșuat');
  process.exit(1);
}

// Test 3 - Auth routes  
if (loadRouteSafely('./routes/authRoutes', 'Auth Routes', '/api/auth')) {
  console.log('🟢 Auth routes încărcate cu succes');
} else {
  console.log('🔴 Auth routes au eșuat');
  process.exit(1);
}

// Test 4 - Services routes
if (loadRouteSafely('./routes/servicesRoutes', 'Services Routes', '/api/services')) {
  console.log('🟢 Services routes încărcate cu succes');
} else {
  console.log('🔴 Services routes au eșuat');
  process.exit(1);
}

// Test 5 - Products routes
if (loadRouteSafely('./routes/productsRoutes', 'Products Routes', '/api/products')) {
  console.log('🟢 Products routes încărcate cu succes');
} else {
  console.log('🔴 Products routes au eșuat');
  process.exit(1);
}

// Test 6 - Orders routes
if (loadRouteSafely('./routes/orderRoutes', 'Orders Routes', '/api/orders')) {
  console.log('🟢 Orders routes încărcate cu succes');
} else {
  console.log('🔴 Orders routes au eșuat');
  process.exit(1);
}

// Test 7 - Contact routes
if (loadRouteSafely('./routes/contactRoutes', 'Contact Routes', '/api/contact')) {
  console.log('🟢 Contact routes încărcate cu succes');
} else {
  console.log('🔴 Contact routes au eșuat');
  process.exit(1);
}

// Test 8 - Reviews routes
if (loadRouteSafely('./routes/reviewRoutes', 'Reviews Routes', '/api/reviews')) {
  console.log('🟢 Reviews routes încărcate cu succes');
} else {
  console.log('🔴 Reviews routes au eșuat');
  process.exit(1);
}

// Test 9 - Admin routes
if (loadRouteSafely('./routes/adminRoutes', 'Admin Routes', '/api/admin')) {
  console.log('🟢 Admin routes încărcate cu succes');
} else {
  console.log('🔴 Admin routes au eșuat');
  process.exit(1);
}

// Test 10 - Admin Products/Services routes
if (loadRouteSafely('./routes/adminProductServiceRoutes', 'Admin Product Service Routes', '/api/admin/products-services')) {
  console.log('🟢 Admin Product Service routes încărcate cu succes');
} else {
  console.log('🔴 Admin Product Service routes au eșuat');
  process.exit(1);
}

// Test 11 - Upload routes
if (loadRouteSafely('./routes/uploadRoutes', 'Upload Routes', '/api/upload')) {
  console.log('🟢 Upload routes încărcate cu succes');
} else {
  console.log('🔴 Upload routes au eșuat');
  process.exit(1);
}

// Test 12 - Invoice routes
if (loadRouteSafely('./routes/invoiceRoutes', 'Invoice Routes', '/api')) {
  console.log('🟢 Invoice routes încărcate cu succes');
} else {
  console.log('🔴 Invoice routes au eșuat');
  process.exit(1);
}

// Test 13 - Payment routes (IMPORTANT pentru plăți)
if (loadRouteSafely('./routes/paymentRoutes', 'Payment Routes', '/api/payments')) {
  console.log('🟢 Payment routes încărcate cu succes');
} else {
  console.log('🔴 Payment routes au eșuat');
  process.exit(1);
}

// Test 14 - Bookings routes (dacă există)
try {
  if (loadRouteSafely('./routes/bookingsRoutes', 'Bookings Routes', '/api/bookings')) {
    console.log('🟢 Bookings routes încărcate cu succes');
  }
} catch (error) {
  console.log('⚠️ Bookings routes nu există, continuăm...');
}

console.log('\n🎉 TOATE RUTELE AU FOST ÎNCĂRCATE CU SUCCES!');
console.log('🚀 Pornind server-ul...\n');

// ▶️ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server pornit cu succes pe http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log('\n🎯 DACĂ VEZI ACEST MESAJ, TOATE RUTELE SUNT OK!');
  console.log('🔧 Problema poate fi în alt loc (middleware, database, etc.)');
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('\n❌ GLOBAL ERROR HANDLER:', error.message);
  console.error('Stack:', error.stack);
  res.status(500).json({ error: error.message });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});