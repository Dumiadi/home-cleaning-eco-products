// const express = require('express');
// const router = express.Router();
// const PDFDocument = require('pdfkit');
// const fs = require('fs-extra');
// const path = require('path');
// const pool = require('../config/db');
// const nodemailer = require('nodemailer');
// const { protect } = require('../middleware/authMiddleware');

// // Creează directorul temporar
// const tempDir = path.join(__dirname, '../temp');
// fs.ensureDirSync(tempDir);

// // ✅ CONFIGURARE EMAIL CU FALLBACK
// let transporter;

// if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
//     process.env.EMAIL_USER !== 'your-email@gmail.com') {
//   transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });
// } else {
//   console.log('📧 Using mock transporter for development');
//   transporter = nodemailer.createTransport({
//     streamTransport: true,
//     newline: 'unix',
//     buffer: true
//   });
// }

// // Testează configurația email
// transporter.verify((error, success) => {
//   if (error) {
//     console.log('⚠️ Email transporter with errors - using DEMO mode');
//     transporter = nodemailer.createTransport({
//       streamTransport: true,
//       newline: 'unix',
//       buffer: true
//     });
//     console.log('✅ Mock Email transporter activated for development');
//   } else {
//     console.log('✅ Email transporter ready and functional');
//   }
// });

// // ✅ RUTA PRINCIPALĂ PENTRU FACTURI
// router.get('/invoice/pdf/:orderId', protect, async (req, res) => {
//   const { orderId } = req.params;
//   const sendEmail = req.query.sendEmail === 'true';

//   console.log(`\n🔍 === DEBUGGING INVOICE REQUEST ===`);
//   console.log(`📋 Order ID requested: ${orderId}`);
//   console.log(`👤 Authenticated user:`, {
//     id: req.user.id,
//     email: req.user.email,
//     role: req.user.role
//   });
//   console.log(`📧 Send email: ${sendEmail}`);

//   try {
//     // ✅ STEP 1: Verifică dacă comanda există în general
//     console.log(`🔍 Step 1: Checking if order exists in database...`);
//     const [allOrderCheck] = await pool.query('SELECT id, user_id FROM orders WHERE id = ?', [orderId]);
    
//     if (allOrderCheck.length === 0) {
//       console.log(`❌ Order #${orderId} does NOT exist in database at all`);
//       return res.status(404).json({ 
//         success: false,
//         message: 'Comanda nu există în sistemul nostru',
//         debug: `Order #${orderId} not found in database`
//       });
//     }
    
//     console.log(`✅ Order exists in database:`, allOrderCheck[0]);
//     const actualOrder = allOrderCheck[0];
    
//     // ✅ STEP 2: Verifică ownership
//     console.log(`🔍 Step 2: Checking ownership...`);
//     console.log(`📊 Order belongs to user_id: ${actualOrder.user_id}`);
//     console.log(`📊 Current user_id: ${req.user.id}`);
//     console.log(`👑 User role: ${req.user.role}`);

//     // ✅ LOGICA DE PERMISIUNE
//     let orderQuery;
//     let queryParams;
//     let hasAccess = false;

//     if (req.user.role === 'admin') {
//       // Admin poate accesa orice comandă
//       hasAccess = true;
//       orderQuery = `
//         SELECT o.*, u.name as user_name, u.email as user_email 
//         FROM orders o
//         LEFT JOIN users u ON o.user_id = u.id
//         WHERE o.id = ?
//       `;
//       queryParams = [orderId];
//       console.log(`👑 ADMIN ACCESS: Allowing access to any order`);
//     } else if (actualOrder.user_id == req.user.id) {
//       // User poate vedea propria comandă (folosim == pentru conversie tip)
//       hasAccess = true;
//       orderQuery = `
//         SELECT o.*, u.name as user_name, u.email as user_email 
//         FROM orders o
//         LEFT JOIN users u ON o.user_id = u.id
//         WHERE o.id = ? AND o.user_id = ?
//       `;
//       queryParams = [orderId, req.user.id];
//       console.log(`👤 USER ACCESS: Order belongs to current user`);
//     } else {
//       console.log(`❌ ACCESS DENIED: Order belongs to user_id ${actualOrder.user_id}, but current user is ${req.user.id}`);
//       return res.status(403).json({
//         success: false,
//         message: 'Nu aveți permisiunea să accesați această comandă',
//         debug: {
//           orderUserId: actualOrder.user_id,
//           currentUserId: req.user.id,
//           userRole: req.user.role
//         }
//       });
//     }

//     // ✅ STEP 3: Obține datele complete ale comenzii
//     console.log(`🔍 Step 3: Fetching full order data...`);
//     const [orderRows] = await pool.query(orderQuery, queryParams);

//     if (orderRows.length === 0) {
//       console.log(`❌ Unexpected: Order disappeared during full query`);
//       return res.status(500).json({ 
//         success: false,
//         message: 'Eroare internă la accesarea comenzii' 
//       });
//     }

//     const order = orderRows[0];
//     console.log(`✅ Full order data retrieved:`, {
//       id: order.id,
//       total: order.total,
//       userEmail: order.user_email,
//       clientUserId: order.user_id
//     });

//     // ✅ STEP 4: Parsarea produselor
//     let items = [];
//     console.log(`🔍 Step 4: Parsing order items...`);
//     console.log(`📦 Raw items data:`, order.items);
    
//     try {
//       items = JSON.parse(order.items || '[]');
//       console.log(`✅ Successfully parsed ${items.length} items:`, items);
//     } catch (error) {
//       console.error('❌ Error parsing items:', error);
//       items = [];
//     }

//     // ✅ STEP 5: Generare PDF
//     const filename = `factura-${orderId}-${Date.now()}.pdf`;
//     const filePath = path.join(tempDir, filename);

//     console.log(`📄 Step 5: Starting PDF generation: ${filename}`);

//     const doc = new PDFDocument({ 
//       margin: 50,
//       info: {
//         Title: `Factura #${orderId}`,
//         Author: 'Eco Cleaning SRL',
//         Subject: 'Factură fiscală',
//         Keywords: 'factură, eco cleaning, servicii'
//       }
//     });
    
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     // === HEADER PDF ===
//     doc.fontSize(22)
//        .fillColor('#1e40af')
//        .text('🧽 ECO CLEANING SRL', { align: 'center' })
//        .fontSize(18)
//        .text('FACTURĂ FISCALĂ', { align: 'center' })
//        .moveDown(1.5);

//     // === INFORMAȚII COMPANIE ===
//     doc.fontSize(10)
//        .fillColor('#374151')
//        .text('Eco Cleaning SRL | CUI: RO12345678 | Reg. Com.: J40/1234/2023', 50, doc.y)
//        .text('IBAN: RO49AAAA1B31007593840000 | Banca Transilvania', 50, doc.y + 12)
//        .text('Adresa: Str. Curățeniei nr. 45, București, Sector 1', 50, doc.y + 12)
//        .text('Telefon: +40 721 123 456 | Email: contact@ecocleaning.ro', 50, doc.y + 12)
//        .moveDown(1);

//     // === LINIE SEPARATOARE ===
//     doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1e40af');
//     doc.moveDown();

//     // === INFORMAȚII FACTURĂ ===
//     const facturaY = doc.y;
//     doc.fontSize(12)
//        .fillColor('#000')
//        .text(`Factură seria ECO nr. ${order.id}`, 50, facturaY)
//        .text(`Data emiterii: ${new Date(order.created_at).toLocaleDateString('ro-RO')}`, 50, facturaY + 18)
//        .text(`Data scadenței: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('ro-RO')}`, 50, facturaY + 36);

//     // === INFORMAȚII CLIENT ===
//     doc.text('CUMPĂRĂTOR:', 320, facturaY)
//        .text(`${order.user_name || 'Client'}`, 320, facturaY + 18)
//        .text(`Email: ${order.user_email}`, 320, facturaY + 36)
//        .text(`ID Client: #${order.user_id}`, 320, facturaY + 54)
//        .moveDown(2);

//     // Indicator admin dacă este generat de admin
//     if (req.user.role === 'admin' && order.user_id != req.user.id) {
//       doc.fontSize(8)
//          .fillColor('#dc2626')
//          .text(`Factură generată de admin: ${req.user.email}`, 320, facturaY + 72)
//          .fillColor('#000')
//          .moveDown();
//     }

//     // === TABEL PRODUSE ===
//     doc.fontSize(14)
//        .fillColor('#1f2937')
//        .text('PRODUSE ȘI SERVICII:', { underline: true })
//        .moveDown(0.5);

//     // Header tabel
//     let tableY = doc.y;
//     doc.rect(50, tableY, 500, 30).fillAndStroke('#1e40af', '#1e40af');
    
//     doc.fillColor('#ffffff')
//        .font('Helvetica-Bold')
//        .fontSize(11)
//        .text('Denumire produs/serviciu', 55, tableY + 10)
//        .text('Cant.', 220, tableY + 10)
//        .text('Preț unit. (RON)', 280, tableY + 10)
//        .text('Total (RON)', 420, tableY + 10);

//     tableY += 30;

//     // Rânduri produse
//     let subtotal = 0;
//     doc.font('Helvetica').fontSize(10);
    
//     if (items.length === 0) {
//       // Fallback când nu sunt produse parsate
//       doc.rect(50, tableY, 500, 25).fillAndStroke('#fff3cd', '#ffc107');
//       doc.fillColor('#856404')
//          .text('⚠️ Produse nu au putut fi parsate. Total comandă: ' + order.total + ' RON', 55, tableY + 8);
//       subtotal = parseFloat(order.total) || 0;
//       tableY += 25;
//     } else {
//       items.forEach((item, index) => {
//         const quantity = item.quantity || 0;
//         const price = item.price || 0;
//         const lineTotal = quantity * price;
//         subtotal += lineTotal;
        
//         // Culori alternative pentru rânduri
//         const rowColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
//         doc.rect(50, tableY, 500, 25).fillAndStroke(rowColor, '#e2e8f0');
        
//         doc.fillColor('#000')
//            .text(item.name || 'Produs necunoscut', 55, tableY + 8, { width: 160, ellipsis: true })
//            .text(quantity.toString(), 230, tableY + 8)
//            .text(price.toFixed(2), 300, tableY + 8)
//            .text(lineTotal.toFixed(2), 440, tableY + 8);
        
//         tableY += 25;
//       });
//     }

//     // === SECȚIUNEA TOTALE ===
//     tableY += 15;
//     const tva = subtotal * 0.19;
//     const totalFinal = subtotal + tva;

//     // Casetă pentru totale
//     doc.rect(320, tableY, 230, 80).fillAndStroke('#f1f5f9', '#1e40af');

//     doc.fontSize(11)
//        .font('Helvetica')
//        .fillColor('#000')
//        .text('SUBTOTAL:', 330, tableY + 10)
//        .text(`${subtotal.toFixed(2)} RON`, 480, tableY + 10)
//        .text('TVA 19%:', 330, tableY + 30)
//        .text(`${tva.toFixed(2)} RON`, 480, tableY + 30);

//     // Total final evidențiat
//     doc.font('Helvetica-Bold')
//        .fontSize(13)
//        .fillColor('#dc2626')
//        .text('TOTAL DE PLATĂ:', 330, tableY + 55)
//        .text(`${totalFinal.toFixed(2)} RON`, 480, tableY + 55);

//     // === FOOTER PROFESIONAL ===
//     doc.fontSize(8)
//        .fillColor('#6b7280')
//        .text('Mulțumim pentru încredere! Pentru suport: contact@ecocleaning.ro', 50, doc.page.height - 60, {
//          align: 'center',
//          width: 500
//        })
//        .text(`Factură generată la: ${new Date().toLocaleString('ro-RO')} | Operator: ${req.user.email}`, {
//          align: 'center'
//        });

//     doc.end();

//     // === FINALIZARE ȘI TRIMITERE ===
//     stream.on('finish', async () => {
//       console.log(`✅ PDF generated successfully: ${filename}`);

//       if (sendEmail) {
//         try {
//           // Pentru admin, email-ul se trimite către clientul comenzii
//           const emailRecipient = order.user_email;
//           console.log(`📧 Sending email to: ${emailRecipient}`);
          
//           const emailOptions = {
//             from: process.env.EMAIL_FROM || '"Eco Cleaning" <no-reply@ecocleaning.ro>',
//             to: emailRecipient,
//             subject: `Factura #${order.id} - Eco Cleaning`,
//             html: `
//               <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
//                 <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
//                   <div style="text-align: center; margin-bottom: 30px;">
//                     <h1 style="color: #1e40af; margin: 0;">🧽 Eco Cleaning</h1>
//                     <p style="color: #6b7280; margin: 5px 0;">Servicii profesionale de curățenie</p>
//                   </div>
                  
//                   <h2 style="color: #1f2937;">Factură #${order.id}</h2>
//                   <p>Bună <strong>${order.user_name || 'Client'}</strong>,</p>
//                   <p>Îți mulțumim pentru comandă! Găsești atașată factura pentru serviciile noastre.</p>
                  
//                   <div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 20px; margin: 25px 0;">
//                     <h3 style="margin: 0 0 15px 0; color: #1e40af;">📋 Detalii factură:</h3>
//                     <table style="width: 100%; border-collapse: collapse;">
//                       <tr><td><strong>Număr factură:</strong></td><td>#${order.id}</td></tr>
//                       <tr><td><strong>Data emiterii:</strong></td><td>${new Date(order.created_at).toLocaleDateString('ro-RO')}</td></tr>
//                       <tr><td><strong>Total de plată:</strong></td><td style="color: #dc2626; font-weight: bold;">${totalFinal.toFixed(2)} RON</td></tr>
//                     </table>
//                   </div>
                  
//                   <p>Pentru întrebări sau suport, ne poți contacta:</p>
//                   <ul style="color: #4b5563;">
//                     <li>📞 <strong>Telefon:</strong> +40 721 123 456</li>
//                     <li>📧 <strong>Email:</strong> contact@ecocleaning.ro</li>
//                     <li>🌐 <strong>Website:</strong> www.ecocleaning.ro</li>
//                   </ul>
                  
//                   <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
//                     <p style="color: #1e40af; font-weight: bold;">Cu respect, Echipa Eco Cleaning</p>
//                     <p style="font-size: 12px; color: #9ca3af;">Această factură a fost generată automat.</p>
//                   </div>
//                 </div>
//               </div>
//             `,
//             attachments: [{
//               filename: `factura-${order.id}.pdf`,
//               path: filePath,
//               contentType: 'application/pdf'
//             }]
//           };

//           const emailResult = await transporter.sendMail(emailOptions);

//           // Verifică dacă este mock sau real
//           if (transporter.options.streamTransport) {
//             console.log('🧪 MOCK EMAIL - Factură "trimisă" cu succes (dezvoltare)');
//           } else {
//             console.log(`✅ Email REAL trimis! MessageId: ${emailResult.messageId}`);
//           }

//           // Șterge fișierul temporar
//           fs.unlinkSync(filePath);
          
//           return res.json({
//             success: true,
//             message: `Factura a fost trimisă pe email către ${emailRecipient} cu succes! 📧`,
//             debug: transporter.options.streamTransport ? 'MOCK_MODE' : 'REAL_EMAIL'
//           });

//         } catch (emailError) {
//           console.error('❌ Eroare la trimiterea emailului:', emailError);
          
//           if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//           }
          
//           return res.status(500).json({
//             success: false,
//             message: 'Email temporar indisponibil. Încearcă descărcarea directă.',
//             error: emailError.message
//           });
//         }
//       } else {
//         // === DESCĂRCARE DIRECTĂ ===
//         console.log(`📥 Starting download for: ${filename}`);
        
//         // Setează header-ele pentru descărcare
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="factura-${orderId}.pdf"`);
        
//         return res.download(filePath, `factura-${orderId}.pdf`, (downloadError) => {
//           // Programează ștergerea fișierului
//           setTimeout(() => {
//             if (fs.existsSync(filePath)) {
//               fs.unlink(filePath, (unlinkError) => {
//                 if (unlinkError) {
//                   console.error('⚠️ Eroare la ștergerea fișierului temp:', unlinkError);
//                 } else {
//                   console.log(`🗑️ Fișier temporar șters: ${filename}`);
//                 }
//               });
//             }
//           }, 2000);
          
//           if (downloadError) {
//             console.error('❌ Eroare la descărcare:', downloadError);
//             return res.status(500).json({
//               success: false,
//               message: 'Eroare la descărcare: ' + downloadError.message
//             });
//           }
          
//           console.log(`✅ Descărcare inițiată cu succes pentru factura #${orderId}`);
//         });
//       }
//     });

//     stream.on('error', (error) => {
//       console.error('❌ Eroare la generarea PDF-ului:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Eroare la generarea PDF-ului: ' + error.message
//       });
//     });

//   } catch (error) {
//     console.error('💥 Eroare generală în ruta invoice:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Eroare server: ' + error.message
//     });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const pool = require('../config/db');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/authMiddleware');

// 🔤 Funcție pentru eliminare diacritice
function removeDiacritics(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[ăĂâÂîÎșȘțȚ]/g, (match) => {
      const diacriticMap = {
        'ă': 'a', 'Ă': 'A',
        'â': 'a', 'Â': 'A',
        'î': 'i', 'Î': 'I',
        'ș': 's', 'Ș': 'S',
        'ț': 't', 'Ț': 'T'
      };
      return diacriticMap[match] || match;
    });
}

// Creează directorul temporar
const tempDir = path.join(__dirname, '../temp');
fs.ensureDirSync(tempDir);

// Funcție de parsare sigură pentru items
function safeParseItems(itemsStr, orderId) {
  try {
    const parsed = JSON.parse(itemsStr || '[]');
    return parsed.length > 0 
      ? parsed 
      : [{ name: 'Comanda fara detalii', quantity: 1, price: 0 }];
  } catch {
    console.warn(`❌ Parsare items eșuată pentru comanda ${orderId}`);
    return [{ name: 'Comanda nedefinita', quantity: 1, price: 0 }];
  }
}

// ✅ CONFIGURARE EMAIL
let transporter;

if (process.env.MAIL_USER && process.env.MAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    secure: false,
    requireTLS: true,
    port: 587
  });
} else {
  console.log('📧 Using mock transporter for development');
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
}

// Verifică transporterul
transporter.verify((error) => {
  if (error) {
    console.log('❌ Eroare configurare email:', error);
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
    console.log('⚠️ Email transporter setat în mod simulat');
  } else {
    console.log('✅ Configurație email validă');
  }
});

// ✅ RUTA PENTRU FACTURI
router.get('/invoice/pdf/:orderId', protect, async (req, res) => {
  const { orderId } = req.params;
  const sendEmail = req.query.sendEmail === 'true';

  try {
    // Query unic și securizat
    const [orderData] = await pool.query(`
      SELECT 
        o.*,
        u.name as user_name, 
        u.email as user_email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? 
      AND (o.user_id = ? OR ? = 'admin')
    `, [orderId, req.user.id, req.user.role]);

    // Verificare comenzi
    if (orderData.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'Comanda indisponibila sau fara permisiune' 
      });
    }

    const order = orderData[0];
    const items = safeParseItems(order.items, orderId);

    // Generare filename unic fara diacritice
    const filename = `factura-${orderId}-${Date.now()}.pdf`;
    const filePath = path.join(tempDir, filename);

    // Creare PDF
    const doc = new PDFDocument({ 
      margin: 50,
      info: {
        Title: `Factura #${orderId}`,
        Author: 'Eco Cleaning SRL'
      }
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // === GENERARE PDF FARA DIACRITICE ===
    doc.fontSize(22)
       .fillColor('#1e40af')
       .text(removeDiacritics('ECO CLEANING SRL'), { align: 'center' })
       .fontSize(18)
       .text(removeDiacritics('FACTURĂ FISCALĂ'), { align: 'center' })
       .moveDown(1.5);

    // Informații companie fara diacritice
    doc.fontSize(10)
       .fillColor('#374151')
       .text(removeDiacritics('Eco Cleaning SRL | CUI: RO12345678'))
       .text(removeDiacritics('IBAN: RO49AAAA1B31007593840000'))
       .text(removeDiacritics('Adresa: Str. Curateniei 45, Bucuresti'))
       .moveDown(1);

    // Informații factură
    doc.fontSize(12)
       .fillColor('#000')
       .text(`Factura #${order.id}`)
       .text(`Data: ${new Date(order.created_at).toLocaleDateString('ro-RO')}`)
       .text(`Client: ${removeDiacritics(order.user_name)}`)
       .moveDown(1);

    // Tabel produse
    let subtotal = 0;
    doc.fontSize(14)
       .text(removeDiacritics('Produse comandate:'), { underline: true })
       .moveDown(0.5);

    items.forEach((item, index) => {
      const lineTotal = (item.quantity || 0) * (item.price || 0);
      subtotal += lineTotal;

      doc.text(`${removeDiacritics(item.name || 'Produs necunoscut')} - ${item.quantity || 0} buc - ${item.price || 0} RON - Total: ${lineTotal.toFixed(2)} RON`);
    });

    // Calcul TVA și total
    const tva = subtotal * 0.19;
    const totalFinal = subtotal + tva;

    doc.moveDown(1)
       .text(`SUBTOTAL: ${subtotal.toFixed(2)} RON`)
       .text(`TVA 19%: ${tva.toFixed(2)} RON`)
       .text(`TOTAL DE PLATĂ: ${totalFinal.toFixed(2)} RON`);

    doc.end();

    // Finalizare și trimitere
    stream.on('finish', async () => {
      if (sendEmail) {
        try {
          const emailOptions = {
            from: process.env.SMTP_FROM || '"Eco Cleaning" <no-reply@ecocleaning.ro>',
            to: order.user_email,
            subject: `Factura #${order.id} - Eco Cleaning`,
            html: `
              <h2>Factura Eco Cleaning</h2>
              <p>Buna ${removeDiacritics(order.user_name)},</p>
              <p>Anexam factura pentru comanda #${order.id}.</p>
              <p>Total: ${totalFinal.toFixed(2)} RON</p>
            `,
            attachments: [{
              filename: `factura-${order.id}.pdf`,
              path: filePath
            }]
          };

          const emailResult = await transporter.sendMail(emailOptions);
          
          console.log(`📧 Email trimis: ${emailResult.messageId}`);
          fs.unlinkSync(filePath);

          return res.json({
            success: true,
            message: 'Factura trimisa pe email cu succes!'
          });

        } catch (emailError) {
          console.error('❌ Eroare trimitere email:', emailError);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          return res.status(500).json({
            success: false,
            message: 'Eroare la trimiterea emailului'
          });
        }
      } else {
        // Descărcare directă PDF
        return res.download(filePath, `factura-${orderId}.pdf`, () => {
          fs.unlinkSync(filePath);
        });
      }
    });

  } catch (error) {
    console.error('💥 Eroare rută factură:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare server'
    });
  }
});

module.exports = router;