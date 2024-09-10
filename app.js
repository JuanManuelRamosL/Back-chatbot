const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userModel = require('./models/userModel');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));

app.use('/', userRoutes);
app.use('/', chatRoutes);

// Crear tabla de usuarios si no existe
userModel.createTableIfNotExists();

module.exports = app;
