import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageRole, ChatMessage } from '../types';

let genAI: GoogleGenerativeAI | null = null;

const getGenAIClient = () => {
  if (genAI) {
    return genAI;
  }

  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set in environment variables");
    // We don't throw immediately to allow UI to handle the error gracefully via the catch block below
  }

  genAI = new GoogleGenerativeAI(apiKey || "");
  return genAI;
};

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const client = getGenAIClient();
    // Use gemini-1.5-flash which is the standard fast model for the stable SDK
    const model = client.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are 'Raj', a helpful and encouraging English Tutor for Class 11 and 12 students in India using the 'EnglishRajDanHi' platform. Keep answers concise, educational, and friendly. Use simple English."
    });

    // Transform history to the format expected by startChat
    // @google/generative-ai expects { role: 'user' | 'model', parts: [{ text: string }] }
    const chatHistory = history.map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessageStream(newMessage);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n(I'm having trouble connecting right now. Please check your internet connection or try again later.)");
  }
};