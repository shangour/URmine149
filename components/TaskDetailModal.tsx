
import React from 'react';
import { Task, Employee, Activity, Attachment } from '../types.ts';
import ProgressTracker from './ProgressTracker.tsx';
import ActivityTimeline from './ActivityTimeline.tsx';
import DeliverablesTracker from './DeliverablesTracker.tsx';
import { DownloadIcon, PaperclipIcon } from './icons.tsx';

interface TaskDetailModalProps {
  task: Task;
  employee?: Employee;
  activities: Activity[];
}

const downloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, employee, activities }) => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-white mb-2">{task.code}</h3>
        <p className="text-gray-300 mb-4">{task.description}</p>
        
        {task.attachment && (
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                    <PaperclipIcon className="w-5 h-5 mr-3 text-gray-400"/>
                    <span className="text-gray-300 font-medium">{task.attachment.name}</span>
                </div>
                <button 
                  onClick={() => downloadAttachment(task.attachment!)}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-semibold"
                >
                    <DownloadIcon className="w-5 h-5"/>
                    <span>Download</span>
                </button>
            </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
            <ProgressTracker task={task} />
        </section>
        <section>
            <DeliverablesTracker task={task} />
        </section>
      </div>

      <section>
        <ActivityTimeline activities={activities} />
      </section>
    </div>
  );
};

export default TaskDetailModal;
