
import React, { useState } from 'react';
// FIX: Add .ts extension to import.
import { Task, BlockerSeverity, BlockerReportPayload } from '../types.ts';
import ScreenshotUpload from './ScreenshotUpload.tsx';

interface BlockerReportModalProps {
  task: Task;
  onClose: () => void;
  onReport: (taskId: string, payload: BlockerReportPayload) => void;
}

const BlockerReportModal: React.FC<BlockerReportModalProps> = ({ task, onClose, onReport }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BlockerSeverity>('Medium');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotData) {
      setError('Screenshot evidence is mandatory when reporting a blocker.');
      return;
    }
    setError('');
    
    const payload: BlockerReportPayload = {
      title,
      description,
      severity,
      screenshotData,
    };
    onReport(task.id, payload);
  };

  const severities: BlockerSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Blocker Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="e.g., Invalid API credentials"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Blocker Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="Provide a detailed description of the issue, including steps to reproduce."
          required
        />
      </div>

       <div>
        <label htmlFor="severity" className="block text-sm font-medium text-gray-300 mb-1">
          Severity
        </label>
        <select
          id="severity"
          name="severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as BlockerSeverity)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {severities.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Screenshot Evidence (Mandatory)
        </label>
        <ScreenshotUpload onScreenshot={setScreenshotData} />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Report Blocker
        </button>
      </div>
    </form>
  );
};

export default BlockerReportModal;