
import React from 'react';
// FIX: Add .ts extension to import.
import { Task } from '../types.ts';
// FIX: Add .tsx extension to import.
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from './icons.tsx';
import { formatDuration } from '../utils/time.ts';

interface ProgressTrackerProps {
  task: Task;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ task }) => {
  const getStatusIcon = (status: Task['phases'][0]['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'In Progress':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
        );
      case 'Blocked':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case 'Pending':
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
      // FIX: Add a case for the 'Under Review' status to render an appropriate icon.
      case 'Under Review':
        return <ClockIcon className="w-6 h-6 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Task Workflow Phases</h3>
      <div className="space-y-4">
        {task.phases.map((phase, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex-shrink-0">{getStatusIcon(phase.status)}</div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-200">{phase.name}</p>
              <div className="text-sm text-gray-400 mt-1">
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                  // FIX: Add styling for the 'Under Review' phase status.
                  phase.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                  phase.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                  phase.status === 'Under Review' ? 'bg-blue-500/20 text-blue-400' :
                  phase.status === 'Blocked' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>{phase.status}</span>
                <span className="mx-2">•</span>
                <span>Expected: {formatDuration(phase.expectedDuration)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Validation: <span className="font-semibold">{phase.validationStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;