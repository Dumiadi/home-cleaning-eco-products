const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Configurare nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dumiadi11@gmail.com',
    pass: 'bhkg odpa bzqo doju'
  }
});

// Salvează comanda în orders.json
const saveOrder = (req, res) => {
  const path = './orders.json';
  const newOrder = req.body;
  let orders = [];

  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf8');
    orders = data ? JSON.parse(data) : [];
  }

  orders.push(newOrder);
  fs.writeFileSync(path, JSON.stringify(orders, null, 2));
  res.send({ message: 'Comandă salvată cu succes!' });
};

// Returnează toate comenzile
const getOrders = (req, res) => {
  const path = './orders.json';
  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf8');
    const orders = data ? JSON.parse(data) : [];
    res.json(orders);
  } else {
    res.json([]);
  }
};

// Generează un număr unic de factură
const getNextInvoiceNumber = () => {
  const path = './invoiceNumber.txt';
  let number = 1;

  if (fs.existsSync(path)) {
    number = parseInt(fs.readFileSync(path, 'utf8'), 10) || 1;
  }

  fs.writeFileSync(path, (number + 1).toString());
  return number.toString().padStart(4, '0'); // ex: 0001
};

// Trimite email cu factură PDF
const sendInvoiceEmail = (req, res) => {
  const { name, address, phone, items, total, email } = req.body;
  const invoiceNumber = getNextInvoiceNumber();

  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #198754;">Curățenie Eco</h1>
        <p>Salut ${name},</p>
        <p>Îți mulțumim pentru comanda ta!</p>
        <p>Găsești atașată <strong>Factura #${invoiceNumber}</strong> 📄.</p>
      </div>
    `;

    transporter.sendMail({
      from: 'Curatenie Eco <dumiadi11@gmail.com>',
      to: email,
      subject: `Factura #${invoiceNumber} - Curățenie Eco`,
      html: emailContent,
      attachments: [
        {
          filename: `factura-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    }, (error, info) => {
      if (error) {
        console.error('Eroare trimitere email:', error);
        res.status(500).send('Eroare la trimitere email');
      } else {
        console.log(`Email trimis:`, info.response);
        res.send('Email trimis cu succes!');
      }
    });
  });

  // Generare conținut PDF
  doc.fontSize(20).text(`Factura #${invoiceNumber} - Curățenie Eco`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Nume Client: ${name}`);
  doc.text(`Adresă: ${address}`);
  doc.text(`Telefon: ${phone}`);
  doc.text(`Email: ${email}`);
  doc.moveDown();
  doc.text('Produse comandate:', { underline: true });
  items.forEach((item, idx) => {
    doc.text(`${idx + 1}. ${item.name} (x${item.quantity}) - ${item.price} RON`);
  });
  doc.moveDown();
  doc.fontSize(16).text(`Total: ${total} RON`, { align: 'right' });
  doc.end();
};

module.exports = {
  saveOrder,
  getOrders,
  sendInvoiceEmail
};
