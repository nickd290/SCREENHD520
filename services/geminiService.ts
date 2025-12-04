
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { PressModel, Message, Sender, PressProfile, KnowledgeEntry } from "../types";

let chatSession: Chat | null = null;

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

// Convert app Message format to Gemini Content format
const formatHistory = (messages: Message[]): Content[] => {
  // Filter out thinking messages and error messages that shouldn't be in context
  const validMessages = messages.filter(m => !m.isThinking && m.text.trim() !== "");
  
  return validMessages.map(msg => {
    return {
      role: msg.sender === Sender.Bot ? 'model' : 'user',
      parts: [{ text: msg.text + (msg.imageUrl ? " [User uploaded an image]" : "") }]
    };
  });
};

export const initializeChat = (profile: PressProfile, history: Message[]) => {
  // 1. Retrieve Learned Knowledge for this Serial Number
  const kbKey = `screen_kb_${profile.serialNumber}`;
  const storedKb = localStorage.getItem(kbKey);
  const knowledgeEntries: KnowledgeEntry[] = storedKb ? JSON.parse(storedKb) : [];

  let learnedContext = "";
  if (knowledgeEntries.length > 0) {
    learnedContext = `
    **PREVIOUS VERIFIED FIXES FOR THIS SERIAL NUMBER (${profile.serialNumber}):**
    The following issues have been successfully resolved on this machine in the past. USE THIS DATA:
    ${knowledgeEntries.map(k => `- Issue: "${k.issue}" -> Fix: "${k.solution}"`).join('\n')}
    `;
  }

  const contextPrompt = `
  **ACTIVE MACHINE CONTEXT**:
  - Serial: ${profile.serialNumber}
  - Model: ${profile.model}
  
  ${learnedContext}

  **STRICT INSTRUCTION FOR AI**:
  - Keep answers SHORT.
  - Use **Bold** for specific buttons or switches.
  - Ask for PHOTOS to verify the user's location.
  - Guide step-by-step. Do not skip ahead.
  `;
  
  const historyContent = formatHistory(history);

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: historyContent,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n\n" + contextPrompt,
      temperature: 0.2, // Very low temperature for precise, robotic adherence to steps
    },
  });
};

export const sendMessageToGemini = async (
  text: string, 
  imageBase64?: string | null
): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!chatSession) {
     throw new Error("Chat session not initialized. Connect a press first.");
  }

  let result;

  if (imageBase64) {
    // Remove prefix if present
    const base64Data = imageBase64.split(',')[1];
    
    const parts = [
      { text },
      {
        inlineData: {
          mimeType: 'image/jpeg', 
          data: base64Data
        }
      }
    ];

    result = await chatSession.sendMessageStream({ 
      content: parts.map(p => {
          if(p.inlineData) return { inlineData: p.inlineData };
          return { text: p.text };
      })
    });
    
  } else {
    result = await chatSession.sendMessageStream({ message: text });
  }

  return result;
};

export const resetChat = (profile: PressProfile) => {
  initializeChat(profile, []);
};
