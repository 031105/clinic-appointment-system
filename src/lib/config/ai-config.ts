import { AIServiceConfig } from '@/types/ai-assistant';

export const AI_CONFIG: AIServiceConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  modelName: 'gemini-pro',
  maxTokens: 1024,
  temperature: 0.7,
};

export const SYSTEM_PROMPT = `
You are an AI assistant for a clinic appointment system. Your name is ClinicBot.
Provide helpful, concise responses about appointments, doctors, medical services, and other clinic-related information.
If you don't know something, acknowledge it and offer to connect the user with a human staff member.
Always maintain a professional but friendly tone.
Do not make up information about specific doctors, appointment slots, or medical advice.
`;

export const MAX_CONVERSATION_LENGTH = 20;
export const AI_ENDPOINT = '/api/ai-assistant';