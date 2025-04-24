export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }
  
  export interface AIAssistantState {
    messages: Message[];
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface AIAssistantContext {
    state: AIAssistantState;
    sendMessage: (message: string) => Promise<void>;
    toggleChat: () => void;
    clearMessages: () => void;
  }
  
  export interface AIServiceConfig {
    apiKey: string;
    modelName: string;
    maxTokens: number;
    temperature: number;
  }
  
  export interface AIRequestPayload {
    prompt: string;
    context?: string;
    userInfo?: {
      isAuthenticated: boolean;
      userId?: string;
      hasAppointments?: boolean;
    };
  }
  
  export interface AIResponsePayload {
    response: string;
    suggestedActions?: string[];
    requiresAuthentication?: boolean;
    additionalContext?: any;
  }