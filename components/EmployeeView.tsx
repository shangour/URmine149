
import React from 'react';
import { Task, Employee, Activity } from '../types.ts';
import { timeSince } from '../utils/time.ts';
import ProgressTracker from './ProgressTracker.tsx';
import ActivityTimeline from './ActivityTimeline.tsx';

interface EmployeeViewProps {
  employee: Employee;
  task: Task | undefined;
  activities: Activity[];
  onOpenModal: (type: 'statusUpdate' | 'blockerReport', taskId: string) => void;
  onSubmitTask: (taskId: string) => void;
  onLogout: () => void;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ employee, task, activities, onOpenModal, onSubmitTask, onLogout }) => {
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <div className="w-full flex justify-end absolute top-4 right-4">
            <button
                onClick={onLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
                Logout
            </button>
        </div>
        <h1 className="text-3xl font-bold text-white">Welcome, {employee.name}!</h1>
        <p className="text-gray-400 mt-2">You have no assigned tasks at the moment.</p>
      </div>
    );
  }

  const isTaskCompleted = task.status === 'Completed' || task.status === 'Under Review';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-white">My Task Dashboard</h1>
            <p className="text-gray-400">Welcome, {employee.name}. Here is your current task.</p>
        </div>
         <button
            onClick={onLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
        >
            Logout
        </button>
      </header>

      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h2 className="text-2xl font-bold text-white">{task.code}</h2>
                  <p className="text-gray-300">{task.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
                  task.status === 'Blocked' ? 'bg-red-500/20 text-red-300' :
                  task.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
              }`}>{task.status}</span>
          </div>

          <div className="flex space-x-6">
              <button
                onClick={() => onOpenModal('statusUpdate', task.id)}
                disabled={isTaskCompleted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Submit Status Update
              </button>
              <button
                onClick={() => onOpenModal('blockerReport', task.id)}
                disabled={isTaskCompleted}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Report Blocker
              </button>
               <button
                onClick={() => onSubmitTask(task.id)}
                disabled={isTaskCompleted}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Submit Task for Review
              </button>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50">
            <ProgressTracker task={task} />
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50">
             <h3 className="text-xl font-bold text-white p-6 pb-0">My Activity</h3>
            <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;
