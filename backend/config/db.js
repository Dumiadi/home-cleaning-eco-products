const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// ✅ CONFIGURAȚIE CURĂȚATĂ - doar opțiunile valide pentru mysql2
const pool = mysql
  .createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'platforma_curatenie',
    
    // ✅ DOAR OPȚIUNILE VALIDE PENTRU mysql2
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    idleTimeout: 60000,
    multipleStatements: true,
    charset: 'utf8mb4',
    timezone: '+02:00'
  })
  .promise();

// 🔧 EVENT HANDLERS pentru fix-urile importante
pool.on('connection', function (connection) {
  console.log(`✅ MySQL: New connection established as ID ${connection.threadId}`);
  
  // 🔑 FORȚEAZĂ AUTOCOMMIT pentru fiecare conexiune nouă (FIX PRINCIPAL!)
  connection.query('SET autocommit = 1', function (error) {
    if (error) {
      console.error('❌ MySQL: Error setting autocommit:', error);
    } else {
      console.log(`✅ MySQL: Autocommit enabled for connection ${connection.threadId}`);
    }
  });
  
  // Setează isolation level (compatibil cu versiuni mai vechi de MySQL)
  connection.query('SET SESSION tx_isolation = "READ-COMMITTED"', function (error) {
    if (error) {
      // Fallback pentru versiuni mai noi
      connection.query('SET SESSION transaction_isolation = "READ_COMMITTED"', function (error2) {
        if (error2) {
          console.warn('⚠️ MySQL: Could not set transaction isolation level');
        } else {
          console.log(`✅ MySQL: Isolation level set for connection ${connection.threadId}`);
        }
      });
    } else {
      console.log(`✅ MySQL: Isolation level set for connection ${connection.threadId}`);
    }
  });
});

pool.on('error', function(err) {
  console.error('❌ MySQL Pool Error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 MySQL: Reconnecting...');
  } else {
    throw err;
  }
});

// ✅ WRAPPER pentru UPDATE-uri critice (păstrăm din configurația anterioară)
pool.updateWithVerification = async function(query, params = []) {
  const connection = await pool.getConnection();
  try {
    console.log(`🔄 Executing critical update: ${query}`);
    console.log(`📋 Params:`, params);
    
    // Setează session pentru această conexiune
    await connection.query('SET autocommit = 1');
    
    // Execute update
    const [result] = await connection.query(query, params);
    
    console.log(`📊 Update result:`, {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      warningCount: result.warningCount
    });
    
    if (result.affectedRows === 0) {
      throw new Error('No rows were affected by the update');
    }
    
    return [result];
  } finally {
    connection.release();
  }
};

// ✅ FUNCȚIE DE TEST pentru verificarea configurației
pool.testConfiguration = async function() {
  try {
    console.log('🧪 Testing MySQL configuration...');
    
    const connection = await pool.getConnection();
    
    // Verifică autocommit
    const [autocommitResult] = await connection.query('SELECT @@autocommit as autocommit');
    console.log(`📋 Autocommit status: ${autocommitResult[0].autocommit}`);
    
    // Test query
    const [testResult] = await connection.query('SELECT 1 as test');
    console.log(`✅ Test query successful: ${testResult[0].test}`);
    
    connection.release();
    
    return {
      autocommit: autocommitResult[0].autocommit,
      connectionWorking: true
    };
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return {
      error: error.message,
      connectionWorking: false
    };
  }
};

// 🔄 Test configurația la startup
pool.testConfiguration().then(result => {
  if (result.connectionWorking) {
    console.log('✅ MySQL configuration validated successfully');
    if (result.autocommit !== 1) {
      console.warn('⚠️ Warning: Autocommit is not enabled by default');
    }
  } else {
    console.error('❌ MySQL configuration validation failed');
  }
}).catch(error => {
  console.error('❌ Failed to test MySQL configuration:', error);
});

module.exports = pool;