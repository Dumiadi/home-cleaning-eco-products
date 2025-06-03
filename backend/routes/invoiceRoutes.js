const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../config/db');

// 📄 Generare PDF pentru o comandă
router.get('/invoice/pdf/:orderId', (req, res) => {
  const { orderId } = req.params;

  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Comandă inexistentă');
    }

    const order = results[0];
    const items = JSON.parse(order.items);

    // Setări răspuns ca PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=factura-${orderId}.pdf`);
    doc.pipe(res);

    // 🧾 Conținut PDF
    doc.fontSize(20).text(`Factura #${order.id}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Data: ${new Date(order.created_at).toLocaleString()}`);
    doc.text(`Client: ID ${order.user_id}`);
    doc.moveDown();

    doc.fontSize(14).text('Produse:', { underline: true });
    items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} – ${item.quantity} x ${item.price} RON`);
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total: ${order.total} RON`, { align: 'right' });
    doc.end();
  });
});

module.exports = router;
