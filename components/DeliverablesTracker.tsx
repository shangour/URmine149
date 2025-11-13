
import React from 'react';
// FIX: Add .ts extension to import.
import { Task } from '../types.ts';
// FIX: Add .tsx extension to import.
import { CheckCircleIcon } from './icons.tsx';

interface DeliverablesTrackerProps {
  task: Task;
}

const DeliverablesTracker: React.FC<DeliverablesTrackerProps> = ({ task }) => {
  const submittedCount = task.deliverables.filter(d => d.isSubmitted).length;
  const totalCount = task.deliverables.length;

  return (
    <div>
      <h3 className="text-xl font-bold text-white">Deliverables</h3>
      <p className="text-sm text-gray-400 mb-4">
        {submittedCount} of {totalCount} submitted
      </p>
      <div className="space-y-3">
        {task.deliverables.map(deliverable => (
          <div
            key={deliverable.id}
            className={`flex items-center p-3 rounded-lg border ${
              deliverable.isSubmitted
                ? 'bg-green-500/10 border-green-500/30 text-gray-300'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            <CheckCircleIcon
              className={`w-5 h-5 mr-3 flex-shrink-0 ${
                deliverable.isSubmitted ? 'text-green-400' : 'text-gray-600'
              }`}
            />
            <span className="flex-grow">{deliverable.type}</span>
            {deliverable.isSubmitted && (
                 <span className="text-xs font-medium bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    Submitted
                 </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliverablesTracker;