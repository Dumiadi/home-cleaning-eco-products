const db = require('../config/db');

// === PRODUSE ===
const getAllProducts = (req, res) => {
  db.query('SELECT * FROM products', (err, result) => {
    if (err) return res.status(500).send('Eroare DB');
    res.json(result);
  });
};

const addProduct = (req, res) => {
  const { name, description, price, category, image } = req.body;
  db.query(
    'INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, category, image],
    (err, result) => {
      if (err) return res.status(500).send('Eroare inserare');
      res.json({ id: result.insertId });
    }
  );
};

const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image } = req.body;
  db.query(
    'UPDATE products SET name=?, description=?, price=?, category=?, image=? WHERE id=?',
    [name, description, price, category, image, id],
    (err) => {
      if (err) return res.status(500).send('Eroare update');
      res.send('Produs actualizat');
    }
  );
};

const deleteProduct = (req, res) => {
  db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).send('Eroare ștergere');
    res.send('Șters cu succes');
  });
};

// === SERVICII ===
const getAllServices = (req, res) => {
  db.query('SELECT * FROM services', (err, result) => {
    if (err) return res.status(500).send('Eroare DB');
    res.json(result);
  });
};

const addService = (req, res) => {
  const { name, description, price } = req.body;
  db.query(
    'INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
    [name, description, price],
    (err, result) => {
      if (err) return res.status(500).send('Eroare inserare');
      res.json({ id: result.insertId });
    }
  );
};

const updateService = (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  db.query(
    'UPDATE services SET name=?, description=?, price=? WHERE id=?',
    [name, description, price, id],
    (err) => {
      if (err) return res.status(500).send('Eroare update');
      res.send('Serviciu actualizat');
    }
  );
};

const deleteService = (req, res) => {
  db.query('DELETE FROM services WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).send('Eroare ștergere');
    res.send('Șters cu succes');
  });
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllServices,
  addService,
  updateService,
  deleteService
};
