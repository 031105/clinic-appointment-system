import { AIRequestPayload, AIResponsePayload, AIServiceConfig } from '@/types/ai-assistant';
import { AI_CONFIG } from '../config/ai-config';

class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateResponse(payload: AIRequestPayload): Promise<AIResponsePayload> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${payload.context || ''}\n\nUser query: ${payload.prompt}`
            }]
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
            topP: 0.8,
            topK: 40,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;

      return {
        response: textResponse,
        // You could add more processing here to extract structured data
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return {
        response: "I'm having trouble connecting to my knowledge base right now. Please try again shortly or contact our support team for immediate assistance.",
      };
    }
  }
}

// Singleton instance with config
export const aiService = new AIService(AI_CONFIG);