const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

/**
 * @swagger
 * /generate-chat-response:
 *   post:
 *     summary: Generate a chat response using Google's Generative AI
 *     description: Generates a text response based on a provided prompt using the Google Generative AI (Gemini model).
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt or input text for the AI model.
 *                 example: "Tell me a story about space exploration."
 *     responses:
 *       200:
 *         description: Successfully generated a response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Once upon a time, humans explored the vastness of space..."
 *       500:
 *         description: Error generating story or external service failure
 */
router.post('/chat', chatController.generateChatResponse);

module.exports = router;
