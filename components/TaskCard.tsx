
import React from 'react';
import { Task, Employee, TaskStatus } from '../types.ts';
import { STATUS_COLORS } from '../constants.ts';
import { formatDuration, timeSince } from '../utils/time.ts';
import { BellIcon, ClockIcon } from './icons.tsx';

interface TaskCardProps {
  task: Task;
  employee?: Employee;
  onViewDetails: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, employee, onViewDetails }) => {
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS['Not Started'];
  const timeElapsed = (Date.now() - task.startTime) / 60000;
  const timeRemaining = task.expectedDuration - timeElapsed;

  const getBorderColor = (status: TaskStatus) => {
    if (status === 'Blocked') return 'border-red-500/80';
    if (timeRemaining < 30 && status === 'In Progress') return 'border-yellow-500/80';
    if (status === 'Under Review') return 'border-blue-500/80';
    return 'border-gray-700/50';
  };

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg border ${getBorderColor(task.status)} flex flex-col justify-between p-5 transition-all hover:border-blue-500 hover:shadow-blue-500/20 group cursor-pointer`}
      onClick={() => onViewDetails(task.id)}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
            {task.status}
          </span>
          <div className="text-right">
            <p className="font-mono text-xs text-gray-400">{task.code}</p>
          </div>
        </div>

        <h3 className="font-bold text-lg text-white mb-2">{task.currentPhase}</h3>
        
        <div className="text-sm text-gray-400 mb-4">
          👤 <span className="font-medium text-gray-300">{employee?.name || 'Unassigned'}</span>
          <span className="mx-2">•</span>
          📋 {task.manager}
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full"
            style={{ width: `${task.progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
          <span>{task.progressPercentage}% complete</span>
          <span>Last update: {timeSince(task.lastUpdateTime)}</span>
        </div>

        {task.dueDate && (
          <div className="flex items-center text-sm text-yellow-400 bg-yellow-500/10 p-2 rounded-md">
            <BellIcon className="w-5 h-5 mr-2"/>
            Due: {new Date(task.dueDate).toLocaleString()}
          </div>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-400 mt-4 pt-4 border-t border-gray-700/50">
          <ClockIcon className="w-4 h-4 mr-2" />
          <span>{formatDuration(timeElapsed)} / {formatDuration(task.expectedDuration)}</span>
      </div>
    </div>
  );
};

export default TaskCard;
