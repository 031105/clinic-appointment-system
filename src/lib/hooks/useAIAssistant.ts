import { useState, useCallback, useEffect } from 'react';
import { Message, AIAssistantState } from '@/types/ai-assistant';
import { AI_ENDPOINT, MAX_CONVERSATION_LENGTH } from '@/lib/config/ai-config';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

export function useAIAssistant() {
  const [state, setState] = useState<AIAssistantState>({
    messages: [
      {
        id: uuidv4(),
        text: "Hello! I'm your clinic assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }
    ],
    isOpen: false,
    isLoading: false,
    error: null
  });

  // Load conversation from localStorage on initial render
  useEffect(() => {
    const savedConversation = localStorage.getItem('aiAssistantConversation');
    if (savedConversation) {
      try {
        const parsed = JSON.parse(savedConversation);
        // Convert string timestamps back to Date objects
        const messages = parsed.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setState(prevState => ({ ...prevState, messages }));
      } catch (e) {
        console.error('Failed to load conversation history:', e);
      }
    }
  }, []);

  // Save conversation to localStorage when it changes
  useEffect(() => {
    if (state.messages.length > 1) { // Only save if there's more than the initial message
      localStorage.setItem('aiAssistantConversation', JSON.stringify({
        messages: state.messages,
        // Don't save other state variables like isOpen
      }));
    }
  }, [state.messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    // Add user message to state
    setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    try {
      // Get last few messages for context
      const conversationHistory = state.messages.slice(-MAX_CONVERSATION_LENGTH);
      
      // Call API
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create AI message
      const aiMessage: Message = {
        id: uuidv4(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      // Add AI message to state
      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, aiMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prevState => ({
        ...prevState,
        error: 'Failed to get a response. Please try again.',
        isLoading: false
      }));
    }
  }, [state.messages]);

  const toggleChat = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      messages: [
        {
          id: uuidv4(),
          text: "Hello! I'm your clinic assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date()
        }
      ]
    }));
    localStorage.removeItem('aiAssistantConversation');
  }, []);

  return {
    state,
    sendMessage,
    toggleChat,
    clearMessages
  };
}

export default useAIAssistant;