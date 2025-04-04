'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MarkdownRenderer } from './MarkdownRenderer';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatProps {
  mode: 'A' | 'B';
}

// Replace direct RAG API integration with calls to our Next.js API route
export function Chat({ mode }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if our API is available
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Simple health check by trying to reach our Next.js API
        await axios.head('/api/chat');
        setApiAvailable(true);
      } catch (error) {
        console.error('API not available:', error);
        setApiAvailable(false);
      }
    };
    
    checkApiAvailability();
  }, []);

  // Reset messages when mode changes
  useEffect(() => {
    setMessages([]);
  }, [mode]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial code review button click
  const handleInitialCodeReview = async () => {
    if (!apiAvailable) {
      setMessages([
        {
          role: 'assistant',
          content: 'Unable to connect to the API. Please try again later.',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Sending initial code review request');
      
      // Call our Next.js API route
      const response = await axios.post('/api/chat', {
        query: 'Provide an initial summary of the code changes.',
        mode,
      });

      console.log('Response received:', response.data);

      // Add assistant response to chat
      setMessages([
        {
          role: 'assistant',
          content: response.data.content,
          timestamp: response.data.timestamp,
        },
      ]);
    } catch (error) {
      console.error('Error fetching initial summary:', error);
      
      // Log more details about the error
      if (axios.isAxiosError(error)) {
        console.error('API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
        });
      }
      
      setMessages([
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error generating the initial summary. Please try again later.',
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
    
    if (!apiAvailable) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to the API. Please try again later.',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }
    
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
      console.log('Sending user query:', input);
      
      // Call our Next.js API route
      const response = await axios.post('/api/chat', {
        query: input,
        mode,
      });
      
      console.log('Response received:', response.data);
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.content,
          timestamp: response.data.timestamp,
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Log more details about the error
      if (axios.isAxiosError(error)) {
        console.error('API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
        });
      }
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again later.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {!apiAvailable && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">API Connection Issue</p>
          <p>Cannot connect to the API. Please try again later or check if the server is running.</p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && mode === 'A' && !isLoading && (
          <div className="text-center mt-8">
            <button
              onClick={handleInitialCodeReview}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!apiAvailable}
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
            placeholder={apiAvailable ? "Type your message..." : "API unavailable. Please start the backend server."}
            className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            disabled={isLoading || !apiAvailable}
            rows={3}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === '' || !apiAvailable}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}