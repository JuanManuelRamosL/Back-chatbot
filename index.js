const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const morgan = require('morgan');
const cors = require('cors');
const { Pool } = require('pg'); 
const genAI = new GoogleGenerativeAI("AIzaSyDifsYmjh4wVv2EA7W5HFYzC46sc0jCLpI");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(morgan('dev'));

const pool = new Pool({
    connectionString: "postgres://default:iwcJl2qgrj9W@ep-polished-hat-a4ajebhl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
  });

  // Crea la tabla si no existe
const createTableIfNotExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      puntaje INTEGER DEFAULT 0
    )
  `;
  try {
    await pool.query(createTableQuery);
    console.log("Table 'users' is ready.");
  } catch (error) {
    console.error("Error creating table 'users':", error);
  }
};

createTableIfNotExists();

const retryWithExponentialBackoff = async (fn, retries = 5, delay = 500) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0 || error.status !== 503) {
            throw error;
        }
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
    }
};

app.post('/chat', async (req, res) => {
    const prompt = req.body.prompt;

    try {
        const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
        const response = result.response;
        const text = response.text();
        console.log(text);
        res.send(text);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating story');
    }
});

// Nueva ruta para crear un usuario
app.post('/create-user', async (req, res) => {
    const { name, email } = req.body;
  
    if (!name || !email) {
      return res.status(400).send('Name and email are required');
    }
  
    try {
      // Verificar si el usuario ya existe
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
      if (existingUser.rows.length > 0) {
        return res.status(409).send('User already exists');
      }
  
      // Crear el usuario si no existe
      const result = await pool.query(
        'INSERT INTO users (name, email, puntaje) VALUES ($1, $2, $3) RETURNING *',
        [name, email, 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating user');
    }
  });
  
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
