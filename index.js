const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const morgan = require('morgan');
const cors = require('cors');

const genAI = new GoogleGenerativeAI("AIzaSyDifsYmjh4wVv2EA7W5HFYzC46sc0jCLpI");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(morgan('dev'));

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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
