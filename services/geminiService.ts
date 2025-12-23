import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check key
export const hasApiKey = () => !!apiKey;

export const generateTriviaQuestion = async (topic: string, difficulty: number) => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `Generate a trivia question about "${topic}" suitable for difficulty level ${difficulty} (1-20). 
  Return JSON with 'question', 'options' (array of 4 strings), and 'correctIndex' (0-3 number).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctIndex"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Trivia Error:", error);
    // Fallback question
    return {
      question: "The connection to the Neural Network was interrupted. Which protocol is best for retrying?",
      options: ["TCP", "UDP", "Gemini Protocol", "Carrier Pigeon"],
      correctIndex: 2
    };
  }
};

export const getCoachAdvice = async (gameName: string, level: number, performance: 'win' | 'loss') => {
  if (!apiKey) return "Focus on your breathing. Try again.";

  const prompt = `I am playing "${gameName}" at level ${level} and just experienced a ${performance}. 
  Give me a short, cryptic, but encouraging "Dark Luxury" style gaming tip. Max 20 words.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim();
  } catch (e) {
    return "The stars are not aligned. Try again.";
  }
};