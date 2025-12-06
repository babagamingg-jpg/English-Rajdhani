import { GoogleGenAI } from "@google/genai";
import { MessageRole, ChatMessage } from '../types';

// Initialize Gemini client
// Note: API Key must be provided in environment variables or replaced here for local testing safely.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!apiKey) {
    onChunk("Error: API Key is missing. Please configure the environment.");
    return;
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Transform history to Gemini format (excluding the very last new message which we send separately)
    // We only keep a limited context for this demo to save tokens
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: model,
      history: recentHistory,
      config: {
        systemInstruction: "You are 'Raj', a helpful and encouraging English Tutor for Class 11 and 12 students in India using the 'EnglishRajDanHi' platform. Keep answers concise, educational, and friendly. Use simple English.",
      },
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n(I'm having trouble connecting right now. Please try again later.)");
    throw error;
  }
};