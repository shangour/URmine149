
import React, { useState } from 'react';
// FIX: Add .ts extension to import.
import { Task, StatusUpdatePayload } from '../types.ts';
import ScreenshotUpload from './ScreenshotUpload.tsx';

interface StatusUpdateModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, payload: StatusUpdatePayload) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ task, onClose, onUpdate }) => {
  const [progress, setProgress] = useState(task.progressPercentage);
  const [activityText, setActivityText] = useState('');
  const [blockersText, setBlockersText] = useState('None');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotData) {
      setError('A screenshot is mandatory for every status update.');
      return;
    }
    setError('');
    
    const payload: StatusUpdatePayload = {
      progressPercentage: progress,
      activityText,
      blockersText,
      screenshotData,
    };
    onUpdate(task.id, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="progress" className="block text-sm font-medium text-gray-300 mb-1">
          Progress Percentage
        </label>
        <select
          id="progress"
          name="progress"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value, 10))}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: 11 }, (_, i) => i * 10).map(p => (
            <option key={p} value={p}>{p}%</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="activity" className="block text-sm font-medium text-gray-300 mb-1">
          Current Task/Activity
        </label>
        <input
          type="text"
          id="activity"
          name="activity"
          value={activityText}
          onChange={(e) => setActivityText(e.target.value)}
          maxLength={200}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="e.g., Setting up the database schema"
          required
        />
      </div>

      <div>
        <label htmlFor="blockers" className="block text-sm font-medium text-gray-300 mb-1">
          Blockers
        </label>
        <textarea
          id="blockers"
          name="blockers"
          rows={3}
          value={blockersText}
          onChange={(e) => setBlockersText(e.target.value)}
          maxLength={500}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="Describe any issues blocking your progress. Write 'None' if there are no blockers."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Screenshot (Mandatory)
        </label>
        <ScreenshotUpload onScreenshot={setScreenshotData} />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit Update
        </button>
      </div>
    </form>
  );
};

export default StatusUpdateModal;