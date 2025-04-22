import { Message } from '@/types/ai-assistant';

export function buildPromptFromMessages(
  messages: Message[],
  systemPrompt: string,
  maxMessages = 10
): string {
  // Take only the most recent messages to avoid exceeding token limits
  const recentMessages = messages.slice(-maxMessages);
  
  let prompt = systemPrompt + "\n\n";
  prompt += "Conversation history:\n";
  
  recentMessages.forEach((message) => {
    const role = message.isUser ? "User" : "Assistant";
    prompt += `${role}: ${message.text}\n`;
  });
  
  prompt += "\nPlease respond to the most recent user message.";
  
  return prompt;
}

export function extractKeywords(message: string): string[] {
  // Simple keyword extraction
  const keywords = [];
  const lowercaseMessage = message.toLowerCase();
  
  // Common clinic-related keywords
  const keywordList = [
    'appointment', 'doctor', 'schedule', 'reschedule', 'cancel',
    'insurance', 'payment', 'prescription', 'refill', 'hours',
    'location', 'emergency', 'specialist', 'test', 'results'
  ];
  
  for (const keyword of keywordList) {
    if (lowercaseMessage.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
}