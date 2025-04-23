'use client';

import { useState } from 'react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
}

export function Settings({ isOpen, onClose, selectedProject, onProjectChange }: SettingsProps) {
  const [inputProject, setInputProject] = useState(selectedProject);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProjectChange(inputProject);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="project">
              Select PR/Project
            </label>
            <select
              id="project"
              value={inputProject}
              onChange={(e) => setInputProject(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="project_1">Project 1</option>
              <option value="project_2">Project 2</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the PR/project you want to review or discuss.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}