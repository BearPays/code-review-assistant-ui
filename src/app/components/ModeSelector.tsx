'use client';

interface ModeSelectorProps {
  mode: 'A' | 'B';
  onModeChange: (mode: 'A' | 'B') => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex border-b mb-4">
      <button
        className={`flex-1 px-4 py-2 font-semibold ${
          mode === 'A' 
            ? 'border-b-2 border-blue-500 text-blue-500' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onModeChange('A')}
      >
        Mode A: Co-Reviewer
      </button>
      
      <button
        className={`flex-1 px-4 py-2 font-semibold ${
          mode === 'B' 
            ? 'border-b-2 border-blue-500 text-blue-500' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onModeChange('B')}
      >
        Mode B: Interactive Assistant
      </button>
    </div>
  );
} 