import React, { useState } from 'react';
import { Task, Employee, Blocker, Activity, User } from '../types.ts';
import TaskCard from './TaskCard.tsx';
import ActivityTimeline from './ActivityTimeline.tsx';
import ProgressTracker from './ProgressTracker.tsx';
import Modal from './Modal.tsx';
import AiBriefingModal from './AiBriefingModal.tsx';
import { PlusIcon, SparklesIcon } from './icons.tsx';

interface ManagerViewProps {
  user: User;
  tasks: Task[];
  employees: Employee[];
  blockers: Blocker[];
  activities: Activity[];
  onViewDetails: (taskId: string) => void;
  onOpenModal: (type: 'taskCreation') => void;
  onLogout: () => void;
  onSeedDatabase: () => void;
  isDbLive: boolean;
}

const ManagerView: React.FC<ManagerViewProps> = ({ user, tasks, employees, blockers, activities, onViewDetails, onOpenModal, onLogout, onSeedDatabase, isDbLive }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(employees[0]?.id || null);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

  const activeBlockers = blockers.filter(b => b.status === 'Open');
  const pendingValidations = tasks.filter(t => t.status === 'Under Review');
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const selectedEmployeeActivities = activities.filter(a => a.employeeId === selectedEmployeeId);
  const selectedEmployeeTask = tasks.find(t => t.id === selectedEmployee?.currentTaskId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">URmine Task Monitor</h1>
          <p className="text-gray-400">Welcome, {user.name}. Here is the real-time task and employee activity dashboard.</p>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={onSeedDatabase} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-md">
                Reset to Sample Data
            </button>
            <button
            onClick={() => onOpenModal('taskCreation')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-transform transform hover:scale-105"
            >
            <PlusIcon className="w-5 h-5" />
            <span>New Task</span>
            </button>
            <button
            onClick={onLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
                Logout
            </button>
        </div>
      </header>
      
      <div className="flex justify-start mb-6">
          <button
            onClick={() => setIsBriefingModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-transform transform hover:scale-105 relative group"
            >
                <SparklesIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                <span>AI Assistant</span>
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-pink-500 items-center justify-center text-xs">✨</span>
                </span>
            </button>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-md p-5 rounded-xl border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium">Active Tasks</h3>
          <p className="text-3xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md p-5 rounded-xl border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium">Active Blockers</h3>
          <p className={`text-3xl font-bold ${activeBlockers.length > 0 ? 'text-red-500' : 'text-white'}`}>
            {activeBlockers.length}
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md p-5 rounded-xl border border-gray-700/50">
          <h3 className="text-gray-400 text-sm font-medium">Pending Validations</h3>
          <p className={`text-3xl font-bold ${pendingValidations.length > 0 ? 'text-yellow-500' : 'text-white'}`}>
            {pendingValidations.length}
          </p>
        </div>
      </div>

      {/* Task Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Task Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              employee={employees.find(e => e.id === task.ownerId)}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Employee Activity Panel */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Employee Activity</h2>
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50">
          <div className="border-b border-gray-700/50">
            <nav className="flex space-x-2 p-2" aria-label="Tabs">
              {employees.map(employee => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployeeId(employee.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    selectedEmployeeId === employee.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {employee.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4">
            {selectedEmployee && selectedEmployeeTask ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h3 className="text-lg font-semibold text-white mb-2">
                     Current Task: <span className="font-normal text-gray-300">{selectedEmployeeTask.code}</span>
                   </h3>
                   <ProgressTracker task={selectedEmployeeTask} />
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-white mb-2">Activity Feed</h3>
                   <ActivityTimeline activities={selectedEmployeeActivities} />
                </div>
              </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>{selectedEmployee?.name} has no active task.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Briefing Modal */}
      <Modal
        isOpen={isBriefingModalOpen}
        onClose={() => setIsBriefingModalOpen(false)}
        title="Manager's AI Daily Briefing"
      >
        <AiBriefingModal
            isDbLive={isDbLive}
            tasks={tasks}
            employees={employees}
            blockers={blockers}
            onClose={() => setIsBriefingModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ManagerView;