
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'platforma_curatenie' 
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Conectare eșuată:', err);
    return;
  }
  console.log('✅ Conectat la baza de date MySQL!');
});

module.exports = connection;
