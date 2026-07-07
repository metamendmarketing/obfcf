const { GoogleGenerativeAI } = require('../node_modules/@google/generative-ai');
const dotenv = require('../node_modules/dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Since the standard SDK might not have a direct listModels on the main client class,
    // we can fetch it via the API or check if it exists on the client.
    console.log("Checking client methods...");
    const client = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Client created successfully.");
    
    // Let's do a request with gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-2.5-flash response:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
