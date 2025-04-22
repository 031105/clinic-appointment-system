import { Message, AIRequestPayload, AIResponsePayload } from '@/types/ai-assistant';
import { aiService } from './ai-service';
import { SYSTEM_PROMPT } from '../config/ai-config';
import { buildPromptFromMessages } from '../utils/ai-prompt-builder';

export class AssistantService {
  async processMessage(
    userMessage: string,
    conversationHistory: Message[],
    userInfo?: AIRequestPayload['userInfo']
  ): Promise<AIResponsePayload> {
    try {
      // For simple queries, we can use pattern matching for faster responses
      const quickResponse = this.getQuickResponse(userMessage);
      if (quickResponse) {
        return { response: quickResponse };
      }

      // Build context from conversation history
      const context = buildPromptFromMessages(conversationHistory, SYSTEM_PROMPT);
      
      // Call the AI service
      const response = await aiService.generateResponse({
        prompt: userMessage,
        context,
        userInfo
      });
      
      // Enhance the response with clinic-specific data if needed
      return this.enhanceResponse(response, userInfo);
    } catch (error) {
      console.error('Error in assistant service:', error);
      return {
        response: "I apologize, but I'm having trouble processing your request. Please try again or contact our support team."
      };
    }
  }

  private getQuickResponse(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Simple pattern matching for common queries
    if (lowerMessage.includes('hours') && lowerMessage.includes('open')) {
      return "Our clinic is open Monday through Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 2:00 PM. We are closed on Sundays and major holidays.";
    }
    
    if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
      return "Hello! I'm ClinicBot, your virtual assistant. How can I help you today?";
    }
    
    // Return null if no quick response matches
    return null;
  }

  private enhanceResponse(
    response: AIResponsePayload,
    userInfo?: AIRequestPayload['userInfo']
  ): AIResponsePayload {
    // Add clinic-specific information to the response if needed
    
    // Example: If the user is not authenticated and asks about appointments
    if (response.response.includes('your appointments') && userInfo && !userInfo.isAuthenticated) {
      response.requiresAuthentication = true;
      response.response += " Please note that you'll need to log in to view or manage your appointments.";
    }
    
    return response;
  }
}

export const assistantService = new AssistantService();