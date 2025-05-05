'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MarkdownRenderer } from './MarkdownRenderer';
import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatProps {
  mode: 'A' | 'B';
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedProject: string;
  sessionId: string | null;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  participantId: string;
}

export function Chat({ mode, messages, setMessages, selectedProject, sessionId, setSessionId, participantId }: ChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset session ID when mode or project changes
  useEffect(() => {
    setSessionId(null);
  }, [mode, selectedProject, setSessionId]);

  // Check if our API is available
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        await axios.get(`${window.location.origin}/api/health`, { timeout: 3000 });
        setApiAvailable(true);
      } catch (error) {
        console.error('API not available:', error);
        setApiAvailable(true); // Allow user to try requests despite health check failure
      }
    };

    checkApiAvailability();
  }, []);

  // Reset messages when mode changes
  useEffect(() => {
    setMessages([]);
  }, [mode, setMessages]);

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
      console.log('Selected project:', selectedProject);
      console.log('Current session ID:', sessionId);
      
      // Call our Next.js API route with the selected project and session ID
      const response = await axios.post('/api/chat', {
        query: 'start review',
        mode,
        messages: [], // Start with empty context for initial review
        selectedProject,
        sessionId,
        participantId
      });

      console.log('Response received:', response.data);

      // Store the session ID received from the backend
      if (response.data.sessionId) {
        console.log('Setting session ID:', response.data.sessionId);
        setSessionId(response.data.sessionId);
      }

      // Handle the response
      if (response.data && response.data.content) {
        setMessages([
          {
            role: 'assistant',
            content: response.data.content,
            timestamp: response.data.timestamp || new Date().toISOString(),
          },
        ]);
      } else if (response.data && response.data.error) {
        throw new Error(response.data.error);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from API');
      }
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

  // Update the handleSubmit function to fix message history and error handling
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
    
    // Important: Update the messages state first
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setInput('');
    
    try {
      console.log('Sending user query:', input);
      console.log('With message history:', updatedMessages.length);
      console.log('Selected project:', selectedProject);
      console.log('Current session ID:', sessionId);
      
      // Send the updated messages array that includes the current user message
      const response = await axios.post('/api/chat', {
        query: input,
        mode,
        messages: updatedMessages,
        selectedProject,
        sessionId,
        participantId
      });
      
      console.log('Response received:', response.data);
      
      // Store the session ID received from the backend
      if (response.data.sessionId) {
        console.log('Setting session ID:', response.data.sessionId);
        setSessionId(response.data.sessionId);
      }
      
      // Handle the response
      if (response.data && response.data.content) {
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: response.data.content,
          timestamp: response.data.timestamp || new Date().toISOString(),
        }]);
      } else if (response.data && response.data.error) {
        throw new Error(response.data.error);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from API');
      }
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
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date().toISOString(),
      }]);
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
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
            disabled={isLoading || input.trim() === ''}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}