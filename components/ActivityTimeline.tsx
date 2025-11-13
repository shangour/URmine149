
import React from 'react';
// FIX: Add .ts extension to import.
import { Activity } from '../types.ts';
import { timeSince } from '../utils/time.ts';
// FIX: Add .tsx extension to import.
import { CameraIcon, CheckCircleIcon, ExclamationCircleIcon } from './icons.tsx';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch(type) {
      case 'Check-in':
      case 'Status Update':
      case 'Phase Completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'Blocker Reported':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-3 h-3 bg-blue-400 rounded-full"></div>;
    }
  };

  if (!activities || activities.length === 0) {
    return <div className="text-center py-10 text-gray-500">No activities recorded yet.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <ol className="relative border-l border-gray-700">
        {activities.sort((a,b) => b.timestamp - a.timestamp).map((activity) => (
          <li key={activity.id} className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-800 rounded-full -left-3 ring-8 ring-gray-800">
              {getIcon(activity.type)}
            </span>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2 text-sm font-normal text-gray-400">
                <span className="font-semibold text-gray-200">{activity.type}</span>
                <span>{timeSince(activity.timestamp)}</span>
              </div>
              <p className="text-gray-300">{activity.description}</p>
              {activity.metadata?.progressPercentage !== undefined && (
                <div className="mt-2 text-xs">
                  Progress: <span className="font-bold text-blue-400">{activity.metadata.progressPercentage}%</span>
                </div>
              )}
              {activity.screenshotId && (
                <div className="mt-3 flex items-center text-xs text-blue-400 cursor-pointer hover:underline">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  <span>Screenshot attached</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ActivityTimeline;