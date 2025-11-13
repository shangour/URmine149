
import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { Task, Employee, Blocker } from '../types.ts';
import { SparklesIcon } from './icons.tsx';

interface AiBriefingModalProps {
  tasks: Task[];
  employees: Employee[];
  blockers: Blocker[];
  onClose: () => void;
  isDbLive: boolean;
}

const AiBriefingModal: React.FC<AiBriefingModalProps> = ({ tasks, employees, blockers, onClose, isDbLive }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBriefing = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setBriefing(null);
    
    if (!isDbLive) {
      setError("The AI Assistant is disabled when using local sample data. A live database connection is required for this feature.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks, employees, blockers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate briefing.');
      }

      const data = await response.json();
      const html = marked.parse(data.briefing);
      setBriefing(html as string);

    } catch (err: any) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }

  }, [tasks, employees, blockers, isDbLive]);

  return (
    <div className="text-gray-300">
      <p className="mb-6">
        Get an AI-powered summary of today's key priorities, team status, and potential risks. The assistant will analyze all active tasks, blockers, and employee activity to provide actionable insights.
      </p>

      {!briefing && !isLoading && (
        <div className="flex justify-center">
            <button
            onClick={generateBriefing}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <SparklesIcon className="w-5 h-5" />
            <span>Generate Daily Briefing</span>
            </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"></div>
          <p className="text-lg">Analyzing data...</p>
        </div>
      )}

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 p-4 rounded-lg">
          <h4 className="font-bold">{!isDbLive ? 'Feature Disabled' : 'An Error Occurred'}</h4>
          <p>{error}</p>
        </div>
      )}

      {briefing && (
        <div 
          className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white max-w-none"
          dangerouslySetInnerHTML={{ __html: briefing }}
        />
      )}
    </div>
  );
};

export default AiBriefingModal;