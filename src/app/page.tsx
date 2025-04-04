'use client';

import { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { ModeSelector } from './components/ModeSelector';
import { Settings } from './components/Settings';

export default function Home() {
  const [mode, setMode] = useState<'A' | 'B'>('A');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white dark:bg-gray-900 border-b shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Code Review AI Assistant</h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col max-w-8xl">
        <ModeSelector mode={mode} onModeChange={setMode} />
        
        <div className="flex-1 border rounded-lg shadow-sm overflow-hidden">
          <Chat mode={mode} />
        </div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
}
