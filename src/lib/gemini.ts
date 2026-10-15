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

export async function generateAIResponse(prompt: string, context?: string): Promise<string> {
  if (!API_KEY) {
    console.error("Gemini: API Key not found in environment variables");
    return "AI Configuration Error: API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  if (API_KEY.includes("YOUR_API_KEY") || API_KEY.length < 10) {
    console.error("Gemini: Invalid API Key format");
    return "AI Configuration Error: The API key appears to be invalid. Please check your VITE_GEMINI_API_KEY in the .env file.";
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
    const text = response.text();
    
    if (!text || text.trim() === '') {
      return "I apologize, but I couldn't generate a response. Please try again.";
    }
    
    return text;
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    
    const err = error as { 
      message?: string; 
      status?: number; 
      statusText?: string;
      error?: { message?: string };
      response?: { status?: number };
    };
    
    const errorMessage = err?.message || err?.error?.message || '';
    const status = err?.status || err?.response?.status;
    
    if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key") || status === 400) {
      return "Error: The API key is invalid. Please verify your Gemini API key in the Google Cloud Console.";
    }
    
    if (status === 401 || status === 403) {
      return "Error: Access denied. Please check if your API key has the correct permissions.";
    }
    
    if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
      return "Network Error: Could not connect to Google AI. Please check your internet connection.";
    }
    
    if (errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED") || status === 429) {
      return "Rate Limit: You've reached the API quota limit. Please wait a moment and try again.";
    }
    
    if (errorMessage.includes("SAFETY") || errorMessage.includes("safety") || errorMessage.includes("blocked")) {
      return "I apologize, but I cannot answer that specific query due to safety filters.";
    }
    
    if (status === 404) {
      return "Error: The Gemini API endpoint was not found. The model may be temporarily unavailable.";
    }
    
    if (status === 503) {
      return "Service Unavailable: The Gemini API is temporarily overloaded. Please try again later.";
    }
    
    if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
      return "Request Timeout: The request took too long. Please try again with a shorter message.";
    }
    
    const detailedError = errorMessage || `Status: ${status || 'Unknown'}`;
    console.error("Detailed error:", detailedError);
    
    return `I apologize, but I encountered an error while processing your request. Please try again later. (Error: ${status || 'Unknown'})`;
  }
}
