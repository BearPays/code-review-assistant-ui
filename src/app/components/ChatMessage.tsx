'use client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString();
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <div className="text-sm font-medium">
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
        <div className="mt-2 text-xs opacity-70 text-right">
          {formattedTime}
        </div>
      </div>
    </div>
  );
} 