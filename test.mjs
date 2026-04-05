import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyBbXd_Q5D6efQYpsiTytJdllLnLuJN-i_4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function run() {
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro"];
  for (const modelName of models) {
    try {
      console.log("Testing:", modelName);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'yes' and nothing else.");
      console.log("SUCCESS:", modelName, "->", await result.response.text());
      return; // Exit on first success
    } catch (e) {
      console.error("FAIL:", modelName, "->", e.message);
    }
  }
}

run();
