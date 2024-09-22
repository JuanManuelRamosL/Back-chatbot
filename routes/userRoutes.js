const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre del usuario
 *         email:
 *           type: string
 *           description: El email del usuario
 *         img:
 *           type: string
 *           description: URL de la imagen del usuario
 */

/**
 * @swagger
 * /create-user:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: El usuario fue creado exitosamente
 *       400:
 *         description: Nombre o email faltante
 *       409:
 *         description: El usuario ya existe
 *       500:
 *         description: Error al crear el usuario
 */
router.post('/create-user', userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error al obtener los usuarios
 */
router.get('/users', userController.getAllUsers);

/**
 * @swagger
 * /update-puntaje:
 *   put:
 *     summary: Actualiza el puntaje de un usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               puntaje:
 *                 type: number
 *     responses:
 *       200:
 *         description: Puntaje actualizado exitosamente
 *       400:
 *         description: Email o puntaje incorrecto
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el puntaje
 */
router.put('/update-puntaje', userController.updateUserPuntaje);

module.exports = router;
