// backend/controllers/contactController.js - FIXED pentru coloana lipsă
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// ✅ CONFIGURARE NODEMAILER
const createEmailTransporter = () => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      sendMail: async (mailOptions) => {
        console.log('\n📧 ===== EMAIL SIMULAT - SUCCES =====');
        console.log(`📤 Către: ${mailOptions.to}`);
        console.log(`📝 Subiect: ${mailOptions.subject}`);
        console.log(`📧 Email simulat trimis cu succes!`);
        console.log('================================\n');
        
        return Promise.resolve({
          messageId: `<simulated_${Date.now()}@localhost>`,
          response: '250 OK: Email simulat trimis cu succes'
        });
      },
      verify: () => Promise.resolve(true)
    };
  }
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// ✅ VERIFICĂ STRUCTURA TABELEI ȘI ADAPTEAZĂ QUERY-UL
const checkTableStructure = async () => {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM contact_messages');
    const columnNames = columns.map(col => col.Field);
    
    return {
      hasServiceType: columnNames.includes('service_type'),
      hasUserAgent: columnNames.includes('user_agent'),
      hasPreferredContact: columnNames.includes('preferred_contact'),
      hasUrgency: columnNames.includes('urgency'),
      hasCompany: columnNames.includes('company'),
      hasService: columnNames.includes('service'),
      availableColumns: columnNames
    };
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    return {
      hasServiceType: false,
      hasUserAgent: false,
      hasPreferredContact: false,
      hasUrgency: false,
      hasCompany: false,
      hasService: false,
      availableColumns: ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'created_at']
    };
  }
};

// ✅ TRIMITE MESAJ CONTACT (ADAPTAT LA STRUCTURA EXISTENTĂ)
const sendContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      service,
      subject,
      message,
      preferredContact,
      urgency,
      serviceType,
      timestamp,
      userAgent
    } = req.body;

    console.log('\n📧 ===== SENDING CONTACT MESSAGE =====');
    console.log('📦 Request body received');

    // ✅ VALIDĂRI
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Subject is required'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('✅ Validation passed');

    // ✅ VERIFICĂ STRUCTURA TABELEI
    const tableStructure = await checkTableStructure();
    console.log('📋 Table structure:', tableStructure);

    // ✅ CONSTRUIEȘTE QUERY-UL DINAMIC pe baza coloanelor disponibile
    const baseColumns = ['name', 'email', 'subject', 'message', 'status', 'created_at'];
    const baseValues = ['?', '?', '?', '?', '?', 'NOW()'];
    const baseParams = [
      name.trim(),
      email.trim().toLowerCase(),
      subject.trim(),
      message.trim(),
      'new'
    ];

    // Adaugă coloanele opționale dacă există în tabelă
    if (tableStructure.hasPhone || tableStructure.availableColumns.includes('phone')) {
      baseColumns.splice(-2, 0, 'phone');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, phone || null);
    }

    if (tableStructure.hasCompany || tableStructure.availableColumns.includes('company')) {
      baseColumns.splice(-2, 0, 'company');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, company || null);
    }

    if (tableStructure.hasService || tableStructure.availableColumns.includes('service')) {
      baseColumns.splice(-2, 0, 'service');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, service || serviceType || null);
    }

    if (tableStructure.hasPreferredContact) {
      baseColumns.splice(-2, 0, 'preferred_contact');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, preferredContact || 'email');
    }

    if (tableStructure.hasUrgency) {
      baseColumns.splice(-2, 0, 'urgency');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, urgency || 'normal');
    }

    if (tableStructure.hasServiceType) {
      baseColumns.splice(-2, 0, 'service_type');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, serviceType || service || null);
    }

    if (tableStructure.hasUserAgent) {
      baseColumns.splice(-2, 0, 'user_agent');
      baseValues.splice(-2, 0, '?');
      baseParams.splice(-1, 0, userAgent || null);
    }

    // ✅ CONSTRUIEȘTE ȘI EXECUTĂ QUERY-UL
    const insertQuery = `
      INSERT INTO contact_messages (${baseColumns.join(', ')}) 
      VALUES (${baseValues.join(', ')})
    `;

    console.log('🔧 Dynamic query:', insertQuery);
    console.log('📊 Parameters:', baseParams);

    const [result] = await pool.query(insertQuery, baseParams);

    console.log('✅ Message saved with ID:', result.insertId);

    // ✅ TRIMITE EMAIL DE NOTIFICARE
    try {
      console.log('📧 Attempting to send notification email...');
      
      const transporter = createEmailTransporter();
      
      const adminEmailOptions = {
        from: `"Eco Cleaning System" <${process.env.EMAIL_USER || 'noreply@localhost'}>`,
        to: process.env.ADMIN_EMAIL || 'admin@localhost',
        subject: `New Contact Message: ${subject}`,
        html: `
          <h2>🌿 New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p><strong>Service:</strong> ${service || 'Not specified'}</p>
          <p><strong>Preferred Contact:</strong> ${preferredContact || 'email'}</p>
          <p><strong>Priority:</strong> ${urgency || 'normal'}</p>
        `
      };

      await transporter.sendMail(adminEmailOptions);
      console.log('✅ Email notification sent');
    } catch (emailError) {
      console.warn('⚠️ Email notification failed:', emailError.message);
    }

    // ✅ RĂSPUNS SUCCES
    res.json({
      success: true,
      message: 'Message sent successfully! We\'ll respond within 2 hours during business hours.',
      data: {
        id: result.insertId,
        timestamp: new Date().toISOString(),
        estimatedResponse: urgency === 'urgent' ? '30 minutes' : '2 hours'
      }
    });

    console.log('🎉 Contact message processing completed successfully');

  } catch (error) {
    console.error('❌ Error processing contact message:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing your message',
      message: 'Please try again or contact us directly.'
    });
  }
};

// ✅ OBȚINE TOATE MESAJELE
const getAllContactMessages = async (req, res) => {
  try {
    console.log('📋 Admin fetching all contact messages...');
    
    const [results] = await pool.query(`
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC
    `);

    console.log('✅ Retrieved', results.length, 'contact messages');
    res.json(results);

  } catch (error) {
    console.error('❌ Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching contact messages'
    });
  }
};

// ✅ MARCHEAZĂ MESAJ CA CITIT
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('👁️ Marking message as read:', id);
    
    // Verifică mai întâi ce coloane sunt disponibile pentru update
    const tableStructure = await checkTableStructure();
    
    let updateQuery = 'UPDATE contact_messages SET status = ?';
    let updateParams = ['read'];
    
    if (tableStructure.availableColumns.includes('read_at')) {
      updateQuery += ', read_at = NOW()';
    }
    
    if (tableStructure.availableColumns.includes('read_by')) {
      updateQuery += ', read_by = ?';
      updateParams.push(req.user.id);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    const [result] = await pool.query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    console.log('✅ Message marked as read');
    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating message status'
    });
  }
};

// ✅ RĂSPUNDE LA MESAJ
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, ccAdmin } = req.body;
    
    console.log('📧 Replying to message:', id);
    
    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Reply content is required'
      });
    }

    // Obține mesajul original
    const [messages] = await pool.query(
      'SELECT * FROM contact_messages WHERE id = ?',
      [id]
    );

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Original message not found'
      });
    }

    const originalMessage = messages[0];

    // ✅ TRIMITE EMAIL DE RĂSPUNS
    try {
      const transporter = createEmailTransporter();
      
      const emailOptions = {
        from: `"Eco Cleaning Services" <${process.env.EMAIL_USER || 'noreply@localhost'}>`,
        to: originalMessage.email,
        cc: ccAdmin ? (process.env.ADMIN_EMAIL || undefined) : undefined,
        subject: `Re: ${originalMessage.subject} - Eco Cleaning Services`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669, #2563eb); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2>🌿 Response from Eco Cleaning Services</h2>
              <p>Thank you for your patience, ${originalMessage.name}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb;">
              <p>Dear ${originalMessage.name},</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 15px 0;">
                ${reply.replace(/\n/g, '<br>')}
              </div>

              <p>If you have any additional questions, please don't hesitate to contact us:</p>
              <ul>
                <li>📞 Phone: +40 722 123 456</li>
                <li>📧 Email: hello@eco-cleaning.com</li>
              </ul>

              <div style="background: #e5e7eb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4>📝 Your Original Message:</h4>
                <strong>Subject:</strong> ${originalMessage.subject}<br>
                <strong>Date:</strong> ${new Date(originalMessage.created_at).toLocaleDateString()}<br>
                <strong>Message:</strong><br>
                <em>${originalMessage.message.replace(/\n/g, '<br>')}</em>
              </div>
            </div>

            <div style="background: #374151; color: white; padding: 20px; border-radius: 0 0 8px 8px;">
              <p><strong>Eco Cleaning Services</strong><br>
              📍 Pitești, Romania</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(emailOptions);
      console.log('✅ Reply email sent successfully');

      // ✅ ACTUALIZEAZĂ MESAJUL ÎN BAZA DE DATE
      const tableStructure = await checkTableStructure();
      
      let updateQuery = 'UPDATE contact_messages SET status = ?';
      let updateParams = ['replied'];
      
      if (tableStructure.availableColumns.includes('replied_at')) {
        updateQuery += ', replied_at = NOW()';
      }
      
      if (tableStructure.availableColumns.includes('replied_by')) {
        updateQuery += ', replied_by = ?';
        updateParams.push(req.user.id);
      }
      
      if (tableStructure.availableColumns.includes('reply_content')) {
        updateQuery += ', reply_content = ?';
        updateParams.push(reply);
      }
      
      updateQuery += ' WHERE id = ?';
      updateParams.push(id);

      await pool.query(updateQuery, updateParams);

      res.json({
        success: true,
        message: 'Reply sent successfully'
      });

    } catch (emailError) {
      console.error('❌ Error sending reply email:', emailError);
      res.status(500).json({
        success: false,
        error: 'Failed to send reply email'
      });
    }

  } catch (error) {
    console.error('❌ Error replying to message:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while sending reply'
    });
  }
};

module.exports = {
  sendContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  replyToMessage
};