const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acces interzis' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id], (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ message: 'Token invalid' });

      req.user = results[0];
      next();
    });

  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

module.exports = { protect };
