import { GoogleGenAI } from "@google/genai";
import { MessageRole, ChatMessage } from '../types';

// Initialize Gemini client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
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