const db = require('../config/db');
const { Parser } = require('json2csv');

// 📊 STATISTICI DASHBOARD
const getAdminStats = (req, res) => {
  let stats = { users: 0, orders: 0, services: 0, revenue: 0 };

  db.query('SELECT COUNT(*) as total FROM users', (_, r1) => {
    stats.users = r1[0].total;

    db.query('SELECT COUNT(*) as total, items FROM orders', (_, r2) => {
      stats.orders = r2.length;
      let total = 0;

      r2.forEach(order => {
        const items = JSON.parse(order.items);
        items.forEach(i => {
          const price = parseFloat(i.price?.replace?.(' RON', '') || 0);
          const qty = parseInt(i.quantity || 1);
          total += price * qty;
        });
      });

      stats.revenue = total;

      db.query('SELECT COUNT(*) as total FROM service_orders', (_, r3) => {
        stats.services = r3[0].total;
        res.json(stats);
      });
    });
  });
};

// 👥 TOȚI UTILIZATORII
const getAllUsers = (req, res) => {
  db.query('SELECT * FROM users ORDER BY created_at DESC', (err, result) => {
    if (err) return res.status(500).json({ error: 'Eroare DB la utilizatori' });
    res.json(result);
  });
};

// 📦 COMENZI PRODUSE
const getAllProductOrders = (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, result) => {
    if (err) return res.status(500).json({ error: 'Eroare DB la comenzi produse' });
    res.json(result);
  });
};

// 🧼 COMENZI SERVICII
const getAllServiceOrders = (req, res) => {
  const sql = `
    SELECT so.*, s.name AS service_name, u.email AS user_email
    FROM service_orders so
    JOIN services s ON so.service_id = s.id
    LEFT JOIN users u ON so.user_id = u.id
    ORDER BY so.date DESC, so.time DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Eroare la extragerea programărilor' });
    res.json(result);
  });
};

// 🔄 STATUS PROGRAMARE
const updateServiceOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query('UPDATE service_orders SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Eroare actualizare status' });
    res.json({ message: 'Status actualizat' });
  });
};

// 🗑️ ȘTERGERE PROGRAMARE
const deleteServiceOrder = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM service_orders WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Eroare la ștergere' });
    res.json({ message: 'Programare ștearsă cu succes' });
  });
};

// 📤 EXPORT PROGRAMĂRI (CSV)
const exportServiceOrders = (req, res) => {
  const sql = `
    SELECT so.id, s.name AS Serviciu, so.date AS Dată, so.time AS Oră, so.address AS Adresă,
           u.email AS Email, so.status AS Status
    FROM service_orders so
    JOIN services s ON so.service_id = s.id
    LEFT JOIN users u ON so.user_id = u.id
    ORDER BY so.date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Eroare la export');

    const parser = new Parser();
    const csv = parser.parse(results);

    res.header('Content-Type', 'text/csv');
    res.attachment('programari.csv');
    res.send(csv);
  });
};

// 📤 EXPORT COMENZI PRODUSE (CSV)
const exportProductOrders = (req, res) => {
  const sql = `
    SELECT o.id, o.created_at AS Dată, o.items, u.email AS Email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Eroare la export comenzi');

    const rows = [];

    results.forEach(row => {
      const items = JSON.parse(row.items);
      items.forEach(item => {
        rows.push({
          Email: row.Email || 'Anonim',
          Dată: row.Dată,
          Produs: item.name,
          Cantitate: item.quantity,
          Preț: item.price
        });
      });
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('comenzi_produse.csv');
    res.send(csv);
  });
};

// 📈 GRAFIC COMENZI SERVICII / LUNĂ
const getServiceOrderStats = (req, res) => {
  const sql = `
    SELECT DATE_FORMAT(date, '%Y-%m') AS month, COUNT(*) as total
    FROM service_orders
    GROUP BY month
    ORDER BY month ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Eroare la grafic');
    res.json(results);
  });
};

// 📈 GRAFIC COMENZI PRODUSE / LUNĂ
const getSalesByMonth = (req, res) => {
  const sql = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, items FROM orders
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Eroare la grafic vânzări' });

    const salesMap = {};

    results.forEach(order => {
      const items = JSON.parse(order.items);
      let sum = 0;

      items.forEach(i => {
        const price = parseFloat(i.price?.replace(' RON', '') || 0);
        const qty = parseInt(i.quantity || 1);
        sum += price * qty;
      });

      salesMap[order.month] = (salesMap[order.month] || 0) + sum;
    });

    const formatted = Object.entries(salesMap).map(([month, total]) => ({
      month,
      total: total.toFixed(2)
    }));

    res.json(formatted);
  });
};

// 🥇 TOP 10 PRODUSE
const getTopProductsChart = (req, res) => {
  db.query('SELECT items FROM orders', (err, results) => {
    if (err) return res.status(500).send('Eroare grafic top produse');

    const countMap = {};

    results.forEach(row => {
      const items = JSON.parse(row.items);
      items.forEach(item => {
        const key = item.name;
        const qty = parseInt(item.quantity || 1);
        countMap[key] = (countMap[key] || 0) + qty;
      });
    });

    const topProducts = Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(topProducts);
  });
};

// 📊 VENITURI PE LUNĂ
const getMonthlyRevenue = (req, res) => {
  const sql = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, items
    FROM orders ORDER BY created_at ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Eroare la extragerea veniturilor' });

    const revenueMap = {};

    results.forEach(row => {
      const items = JSON.parse(row.items);
      const month = row.month;
      let orderTotal = 0;

      items.forEach(item => {
        const price = parseFloat(item.price?.replace(' RON', '') || 0);
        const qty = parseInt(item.quantity || 1);
        orderTotal += price * qty;
      });

      revenueMap[month] = (revenueMap[month] || 0) + orderTotal;
    });

    const formatted = Object.entries(revenueMap).map(([month, total]) => ({
      month,
      total: total.toFixed(2)
    }));

    res.json(formatted);
  });
};

// ✅ Export toate funcțiile
module.exports = {
  getAdminStats,
  getAllUsers,
  getAllProductOrders,
  getAllServiceOrders,
  updateServiceOrderStatus,
  deleteServiceOrder,
  exportServiceOrders,
  exportProductOrders,
  getServiceOrderStats,
  getSalesByMonth,
  getTopProductsChart,
  getMonthlyRevenue
};
