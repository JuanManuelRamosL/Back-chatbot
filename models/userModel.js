const pool = require('../config/db');

// Función para crear la tabla si no existe
const createTableIfNotExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      puntaje INTEGER DEFAULT 0,
      ejercicios_resueltos INTEGER DEFAULT 0,
      img VARCHAR(255)
    )
  `;
  await pool.query(createTableQuery);
};

const createUser = async (name, email, img) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, puntaje, img, ejercicios_resueltos) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, 0, img || null, 0]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const updateUserPuntaje = async (email, puntaje) => {
  const result = await pool.query(
    'UPDATE users SET puntaje = puntaje + $1 WHERE email = $2 RETURNING *',
    [puntaje, email]
  );
  return result.rows[0];
};

// Otros métodos como eliminar usuarios, restar puntaje, etc.

module.exports = {
  createTableIfNotExists,
  createUser,
  getUserByEmail,
  getAllUsers,
  updateUserPuntaje,
  // Exportar otros métodos si es necesario
};
