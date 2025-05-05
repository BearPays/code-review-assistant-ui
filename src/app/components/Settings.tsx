'use client';

import { useState, useEffect } from 'react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  participantId: string;
  onParticipantIdChange: (participantId: string) => void;
}

export function Settings({ isOpen, onClose, selectedProject, onProjectChange, participantId, onParticipantIdChange }: SettingsProps) {
  const [inputProject, setInputProject] = useState(selectedProject);
  const [inputParticipantId, setInputParticipantId] = useState(participantId);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();

        if (data.projects.length === 0) {
          setWarning('No projects available. Please check the server.');
        } else {
          setWarning(null);
        }

        setProjectOptions(data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setWarning('Failed to fetch projects. Please try again later.');
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProjectChange(inputProject);
    onParticipantIdChange(inputParticipantId);
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

        {warning && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 border border-yellow-500 rounded">
            {warning}
          </div>
        )}

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
              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the PR/project you want to review or discuss.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="participantId">
              Participant ID
            </label>
            <input
              id="participantId"
              type="text"
              value={inputParticipantId}
              onChange={(e) => setInputParticipantId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your participant ID"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the participant ID for this review session.
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