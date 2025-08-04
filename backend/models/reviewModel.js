const pool = require('../config/db');

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM reviews');
  return rows;
};

const add = async (review) => {
  const { name, rating, comment } = review;
  const [result] = await pool.query(
    'INSERT INTO reviews (name, rating, comment, date) VALUES (?, ?, ?, NOW())',
    [name, rating, comment]
  );
  return result;
};

module.exports = {
  getAll,
  add
};
