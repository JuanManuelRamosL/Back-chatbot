const userModel = require('../models/userModel');

const createUser = async (req, res) => {
  const { name, email, img } = req.body;
  if (!name || !email) {
    return res.status(400).send('Name and email are required');
  }
  try {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).send('User already exists');
    }
    const newUser = await userModel.createUser(name, email, img);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send('Error creating user');
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
};

const updateUserPuntaje = async (req, res) => {
  const { email, puntaje } = req.body;
  if (!email || typeof puntaje !== 'number') {
    return res.status(400).send('Email and puntaje are required');
  }
  try {
    const updatedUser = await userModel.updateUserPuntaje(email, puntaje);
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).send('Error updating puntaje');
  }
};

// Exportar todas las funciones necesarias
module.exports = {
  createUser,
  getAllUsers,
  updateUserPuntaje,
};
