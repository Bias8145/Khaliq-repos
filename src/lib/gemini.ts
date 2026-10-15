import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const SYSTEM_PROMPT = `
You are the intelligent assistant for "Khaliq Repository", a digital garden and portfolio belonging to Bias Fajar Khaliq.
Your name is "Khaliq AI".

ABOUT THE AUTHOR (Bias Fajar Khaliq):
- Profession: Water Treatment Professional & Android Developer.
- Based in: Indonesia.
- Education: Universitas Nusa Putra (Class of 2022).
- Skills: AutoCAD, Data Analysis, HSE Compliance (K3), Custom ROM Development.
- Community Presence: Active on XDA Developers as "Khaliq Morpheus".
- Key Projects: Pixel 6 Series (Oriole, Raven), Pixel 4 Series.
- Interests: Philosophy, Science, Technology, and System Optimization.

YOUR ROLE:
- Answer questions about Bias Fajar Khaliq.
- Help users explore the repository.
- Be polite, concise, and professional.
- Use a "Low Profile" but helpful tone.
- If asked about specific posts, try to summarize the context if provided.

IMPORTANT:
- If asked about the website statistics or private data, politely decline.
- Keep answers relatively short (under 3 paragraphs) unless asked for details.
`;

export async function generateAIResponse(prompt: string, context?: string) {
  if (!API_KEY || API_KEY.includes("YOUR_API_KEY")) {
    console.error("Gemini: Invalid API Key");
    return "AI Configuration Error: Please check the VITE_GEMINI_API_KEY in your .env file.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `
      ${SYSTEM_PROMPT}
      
      ${context ? `CURRENT PAGE CONTEXT: ${context}` : ''}
      
      USER QUESTION: ${prompt}
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    
    const err = error as { 
      message?: string; 
      status?: number; 
      statusText?: string;
      error?: { message?: string };
    };
    
    const errorMessage = err?.message || err?.error?.message || '';
    const status = err?.status;
    
    if (errorMessage.includes("API key") || status === 401 || status === 403) {
      return "Error: The API key is invalid or expired. Please check your Gemini API key configuration.";
    }
    
    if (errorMessage.includes("fetch") || errorMessage.includes("network") || status === 503) {
      return "Network Error: Could not connect to Google AI. Please check your internet connection.";
    }
    
    if (errorMessage.includes("quota") || status === 429) {
      return "Rate Limit: You've reached the API quota limit. Please try again later.";
    }
    
    if (errorMessage.includes("candidate") || errorMessage.includes("safety")) {
      return "I apologize, but I cannot answer that specific query due to safety filters.";
    }
    
    if (errorMessage.includes("not found") || status === 404) {
      return "Error: The Gemini API endpoint was not found. The model may be unavailable.";
    }
    
    return "I apologize, but I am currently unable to process your request. Please try again later.";
  }
}
