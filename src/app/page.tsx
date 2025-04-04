'use client';

import { useState, useEffect } from 'react';
import { Chat, Message } from './components/Chat';
import { ModeSelector } from './components/ModeSelector';
import { Settings } from './components/Settings';
import { CustomDialog } from './components/CustomDialog';
import Image from 'next/image';

export default function Home() {
  const [mode, setMode] = useState<'A' | 'B'>('A');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]); // Explicitly typed as Message[]
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'A' | 'B' | null>(null);

  // Load API key from localStorage on initial render
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Open settings if no API key is found
      setIsSettingsOpen(true);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai-api-key', key);
  };

  const handleModeChange = (newMode: 'A' | 'B') => {
    if (messages.length > 0) {
      setPendingMode(newMode);
      setIsDialogOpen(true);
      return;
    }
    setMode(newMode);
    setMessages([]); // Clear chat history
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      setMode(pendingMode);
      setMessages([]);
    }
    setIsDialogOpen(false);
    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setIsDialogOpen(false);
    setPendingMode(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white dark:bg-gray-900 border-b shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/Code Review Assistant Logo.png"
              alt="Code Review Assistant Logo"
              width={40}
              height={40}
            />
            <h1 className="text-xl font-bold">Code Review AI Assistant</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col max-w-8xl">
        <ModeSelector mode={mode} onModeChange={handleModeChange} />
        
        <div className="flex-1 border rounded-lg shadow-sm overflow-hidden">
          <Chat mode={mode} messages={messages} setMessages={setMessages} />
        </div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      <CustomDialog
        isOpen={isDialogOpen}
        title="Confirm Mode Change"
        message="Switching modes will erase the chat history. Are you sure you want to proceed?"
        onConfirm={confirmModeChange}
        onCancel={cancelModeChange}
      />
    </div>
  );
}
