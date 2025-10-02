const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const cleanMarkdown = (text) => {
  return text
    .replace(/[#*_]+/g, '')  // Elimina encabezados, negrita y cursiva
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // Elimina enlaces, dejando solo el texto
    .replace(/!\[.*?\]\(.*?\)/g, '')  // Elimina imágenes
    .replace(/^\s+|\s+$/g, '')  // Elimina espacios en blanco innecesarios
    .replace(/\n{2,}/g, '\n');  // Reemplaza múltiples saltos de línea con uno solo
};

const retryWithExponentialBackoff = async (fn, retries = 5, delay = 500) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.status !== 503) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
  }
};

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
 *       400:
 *         description: Bad request, invalid input data
 *       500:
 *         description: Error generating story or external service failure
 */
const generateChatResponse = async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const rawText = result.response.text();
    const cleanedText = cleanMarkdown(rawText);  // Limpiamos el Markdown antes de enviar la respuesta
    res.send(cleanedText);
  } catch (error) {
    res.status(500).send('Error generating story');
  }
};

module.exports = { generateChatResponse };
