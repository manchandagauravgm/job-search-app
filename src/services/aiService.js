import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini SDK with Environment Variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const getTailoredResume = async (masterResume, jobDescription) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API Key! Please ensure VITE_GEMINI_API_KEY is set in your .env file.");
  }

  const prompt = `
You are an expert executive resume writer. I am going to provide you with my Master Resume and a text Job Description for a role I am actively applying to.
Please analyze the job description and intricately rewrite my resume bullet points. Highlight the most relevant skills, match keywords, and format the final output cleanly. Do not invent fake experience, just frame existing experience better.

### MASTER RESUME ###
${masterResume}

### JOB DESCRIPTION ###
${jobDescription}

Please provide the final tailored resume formatted beautifully in Markdown:
`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use gemini-flash-latest for the fastest, cheapest text processing
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Tailoring Error:", error);
    throw new Error(`Gemini Error: ${error.message} - Please check your API Key and network connection.`);
  }
};
