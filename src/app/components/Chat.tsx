'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatProps {
  mode: 'A' | 'B';
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function Chat({ mode, messages, setMessages }: ChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset messages when mode changes
  useEffect(() => {
    setMessages([]);
  }, [mode, setMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get API key from localStorage
  const getApiKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openai-api-key') || '';
    }
    return '';
  };

  // Handle initial code review button click
  const handleInitialCodeReview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          mode: 'A',
          apiKey: getApiKey(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();

      setMessages([
        {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp,
        },
      ]);
    } catch (error) {
      console.error('Error fetching initial summary:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error generating the initial summary. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() === '' || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');
    
    try {
      // Format messages for the API
      const apiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: input,
      });
      
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          mode,
          apiKey: getApiKey(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp,
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && mode === 'A' && !isLoading && (
          <div className="text-center mt-8">
            <button
              onClick={handleInitialCodeReview}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate Initial Code Review
            </button>
          </div>
        )}

        {messages.length === 0 && mode === 'A' && isLoading && (
          <div className="text-center text-gray-500 mt-8">
            Generating code review summary...
          </div>
        )}

        {messages.length === 0 && mode === 'B' && (
          <div className="text-center text-gray-500 mt-8">
            Ask me anything about your code!
          </div>
        )}
        
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            renderContent={(content) =>
              message.role === 'assistant' ? (
                <MarkdownRenderer markdown={content} />
              ) : (
                content
              )
            }
          />
        ))}
        
        {isLoading && messages.length > 0 && (
          <div className="text-gray-500 animate-pulse">Assistant is typing...</div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            disabled={isLoading}
            rows={3}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}