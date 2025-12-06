import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MessageRole, ChatMessage } from '../types';

let ai: GoogleGenAI | null = null;

const getGenAIClient = () => {
  if (ai) {
    return ai;
  }

  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
};

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const client = getGenAIClient();
    
    // Transform history to Gemini Content format
    // Map recent history (last 10 messages) to the structure expected by generateContent
    const contents = history.slice(-10).map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Add the current new message to the conversation
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }],
    });

    // Use gemini-2.5-flash for basic text tutoring tasks
    const response = await client.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are 'Raj', a helpful and encouraging English Tutor for Class 11 and 12 students in India using the 'EnglishRajDanHi' platform. Keep answers concise, educational, and friendly. Use simple English.",
      }
    });

    for await (const chunk of response) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n(I'm having trouble connecting right now. Please check your internet connection or try again later.)");
  }
};