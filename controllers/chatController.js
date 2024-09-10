const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

const generateChatResponse = async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const text = result.response.text();
    res.send(text);
  } catch (error) {
    res.status(500).send('Error generating story');
  }
};

module.exports = { generateChatResponse };
