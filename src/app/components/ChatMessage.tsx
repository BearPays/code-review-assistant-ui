'use client';

import { JSX } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  renderContent?: (content: string) => JSX.Element | string;
}

export function ChatMessage({ message, renderContent }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
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
        {!isUser && (
          <div className="text-sm font-medium">
            Assistant
          </div>
        )}
        <div className="mt-1 whitespace-pre-wrap">
          {renderContent ? renderContent(message.content) : (
            isUser ? message.content : <MarkdownRenderer markdown={message.content} />
          )}
        </div>
        <div className="mt-2 text-xs opacity-70 text-right">
          {formattedTime}
        </div>
      </div>
    </div>
  );
}