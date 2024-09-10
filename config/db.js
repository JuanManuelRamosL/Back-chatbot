const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL // Usar la URL de conexión desde el archivo .env
});

module.exports = pool;
