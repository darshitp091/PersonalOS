import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askGemini(prompt: string, history: any[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are Darshit's OS AI Assistant.
        You represent the user (Darshit) to his visitors.
        You have access to integrated tools:
        - Gmail (to check daily briefings)
        - Calendar (to check schedules)
        - Stripe (to handle hiring)
        - Spotify (to play music)
        
        Keep your tone: Technical, sleek, and helpful. Use markdown for better formatting.
        If asked about skills, work, or personality, answer as an advanced personal OS.`,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: Unable to connect to neural link. Please check your system logs.";
  }
}
