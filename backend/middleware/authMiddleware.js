
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - verificare token...');
    
    // ✅ Extrage token-ul din header
    let token = req.headers.authorization;
    
    if (!token) {
      console.log('❌ Nu există header de autorizare');
      return res.status(401).json({ 
        success: false,
        message: 'Acces interzis - token lipsă' 
      });
    }

    // ✅ Extrage token-ul din "Bearer TOKEN"
    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      console.log('❌ Token lipsă după extragere');
      return res.status(401).json({ 
        success: false,
        message: 'Acces interzis - format token invalid' 
      });
    }

    console.log('🔑 Token găsit:', token.substring(0, 20) + '...');

    // ✅ Verifică token-ul JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    console.log('🔓 Token decodat:', { id: decoded.id, role: decoded.role });

    // ✅ Găsește utilizatorul în baza de date
    const [results] = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?', 
      [decoded.id]
    );

    if (results.length === 0) {
      console.log('❌ Utilizator nu există pentru ID:', decoded.id);
      return res.status(401).json({ 
        success: false,
        message: 'Token invalid - utilizator inexistent' 
      });
    }

    const user = results[0];
    console.log('👤 Utilizator autentificat:', { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    // ✅ Verifică dacă contul este activ
    if (user.status === 'inactive') {
      console.log('❌ Cont inactiv pentru utilizatorul:', user.id);
      return res.status(403).json({ 
        success: false,
        message: 'Contul este dezactivat' 
      });
    }

    // ✅ Atașează utilizatorul la request
    req.user = user;
    next();

  } catch (error) {
    console.error('💥 Eroare auth middleware:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token invalid' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirat' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Eroare server la autentificare' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  console.log('👑 Verificare permisiuni admin...');
  console.log('👤 Utilizator curent:', { 
    id: req.user?.id, 
    role: req.user?.role 
  });

  if (!req.user) {
    console.log('❌ Nu există utilizator în request');
    return res.status(401).json({ 
      success: false,
      message: 'Utilizator neautentificat' 
    });
  }

  if (req.user.role !== 'admin') {
    console.log('❌ Permisiuni insuficiente. Rol curent:', req.user.role);
    return res.status(403).json({ 
      success: false,
      message: 'Acces interzis - permisiuni admin necesare' 
    });
  }

  console.log('✅ Permisiuni admin confirmate');
  next();
};

// ✅ Middleware opțional pentru user normal
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Utilizator neautentificat' 
    });
  }

  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Permisiuni insuficiente' 
    });
  }

  next();
};

module.exports = { protect, requireAdmin, requireUser };