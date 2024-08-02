const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyDifsYmjh4wVv2EA7W5HFYzC46sc0jCLpI");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function run() {
    const prompt = "Write a story about an AI and magic"
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  }
  
  run();