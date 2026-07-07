const { GoogleGenerativeAI } = require('./node_modules/@google/generative-ai');
const dotenv = require('./node_modules/dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey ? `${apiKey.substring(0, 5)}...` : "MISSING");

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello!");
    console.log(`Success with ${modelName}! Response:`, result.response.text());
    return true;
  } catch (error) {
    console.error(`Failed with ${modelName}:`, error.message);
    return false;
  }
}

async function run() {
  await testModel("gemini-3.1-flash-lite");
  await testModel("gemini-1.5-flash");
}

run();
