const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const morgan = require('morgan');
const cors = require('cors');
const { Pool } = require('pg'); 
require('dotenv').config();
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
// const genAI = new GoogleGenerativeAI("AIzaSyDifsYmjh4wVv2EA7W5HFYzC46sc0jCLpI");
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
      puntaje INTEGER DEFAULT 0,
      ejercicios_resueltos INTEGER DEFAULT 0
      img VARCHAR(255)
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
    const { name, email,img  } = req.body;
  
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
        'INSERT INTO users (name, email, puntaje, img, ejercicios_resueltos) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, 0, img || null, 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating user');
    }
  });
  
  app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});

// Nueva ruta para actualizar el puntaje de un usuario
app.put('/update-puntaje', async (req, res) => {
  const { email, puntaje } = req.body;

  if (!email || typeof puntaje !== 'number') {
      return res.status(400).send('Email and puntaje are required');
  }

  try {
      const result = await pool.query(
          'UPDATE users SET puntaje = puntaje + $1 WHERE email = $2 RETURNING *',
          [puntaje, email]
      );

      if (result.rows.length === 0) {
          return res.status(404).send('User not found');
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating puntaje');
  }
});

app.put('/update-puntaje-restar', async (req, res) => {
  const { email, puntaje } = req.body;

  if (!email || typeof puntaje !== 'number') {
      return res.status(400).send('Email and puntaje are required');
  }

  try {
      const result = await pool.query(
          'UPDATE users SET puntaje = puntaje - $1 WHERE email = $2 RETURNING *',
          [puntaje, email]
      );

      if (result.rows.length === 0) {
          return res.status(404).send('User not found');
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating puntaje');
  }
});
app.delete('/reset-users', async (req, res) => {
  try {
    await pool.query('DELETE FROM users');
    res.status(200).send('All users have been deleted');
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).send('Error deleting users');
  }
});

app.put('/update-ejercicios', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const result = await pool.query(
      'UPDATE users SET ejercicios_resueltos = ejercicios_resueltos + 1 WHERE email = $1 RETURNING *',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating ejercicios_resueltos');
  }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
