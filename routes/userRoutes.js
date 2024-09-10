const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/create-user', userController.createUser);
router.get('/users', userController.getAllUsers);
router.put('/update-puntaje', userController.updateUserPuntaje);

module.exports = router;
