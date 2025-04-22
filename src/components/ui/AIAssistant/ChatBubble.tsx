import React from 'react';
import { Message } from '@/types/ai-assistant';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  return (
    <div 
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
      data-testid={`chat-bubble-${message.isUser ? 'user' : 'ai'}`}
    >
      <div
        className={`rounded-lg max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 ${
          message.isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p className="text-xs mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;