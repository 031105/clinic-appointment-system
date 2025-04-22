import React from 'react';
import { MessageSquare } from 'lucide-react';
import ChatWindow from './ChatWindow';
import useAIAssistant from '@/lib/hooks/useAIAssistant';

const AIAssistant: React.FC = () => {
  const { state, sendMessage, toggleChat } = useAIAssistant();
  const { isOpen, messages, isLoading } = state;

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all z-50"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onClose={toggleChat}
        />
      )}
    </>
  );
};

export default AIAssistant;