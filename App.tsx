
import React, { useState, useEffect, useCallback } from 'react';
import {
  Task, Employee, Blocker, Activity, ModalState, User, StatusUpdatePayload,
  BlockerReportPayload, TaskCreationPayload, Notification as NotificationType
} from './types';
import {
  TASKS as MOCK_TASKS, EMPLOYEES as MOCK_EMPLOYEES,
  BLOCKERS as MOCK_BLOCKERS, ACTIVITIES as MOCK_ACTIVITIES, SCREENSHOTS as MOCK_SCREENSHOTS
} from './constants';
import { authenticateUser } from './auth';
import Login from './components/Login';
import ManagerView from './components/ManagerView';
import EmployeeView from './components/EmployeeView';
import Modal from './components/Modal';
import TaskDetailModal from './components/TaskDetailModal';
import StatusUpdateModal from './components/StatusUpdateModal';
import BlockerReportModal from './components/BlockerReportModal';
import TaskCreationModal from './components/TaskCreationModal';
import Notification from './components/Notification';

// Main App Component
const App: React.FC = () => {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState('');

  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isDbLive, setIsDbLive] = useState(false);

  // --- Data Fetching and Management ---

  const addNotification = useCallback((message: string, type: NotificationType['type'] = 'info') => {
    const newNotification: NotificationType = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const loadMockData = useCallback(() => {
    setTasks(MOCK_TASKS);
    setEmployees(MOCK_EMPLOYEES);
    setBlockers(MOCK_BLOCKERS);
    setActivities(MOCK_ACTIVITIES);
    setIsLoading(false);
    setIsDbLive(false);
    addNotification("Could not connect to the database. Loaded local sample data.", 'warning');
  }, [addNotification]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksRes, employeesRes, blockersRes, activitiesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/employees'),
        fetch('/api/blockers'),
        fetch('/api/activities')
      ]);

      if (!tasksRes.ok || !employeesRes.ok || !blockersRes.ok || !activitiesRes.ok) {
        throw new Error('Network response was not ok');
      }

      setTasks(await tasksRes.json());
      setEmployees(await employeesRes.json());
      setBlockers(await blockersRes.json());
      setActivities(await activitiesRes.json());
      setIsDbLive(true);
      // addNotification("Successfully connected to the database.", 'success');
    } catch (error) {
      console.error("Failed to fetch data:", error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  }, [loadMockData]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setIsLoading(false); // Not loading if not logged in
    }
  }, [user, fetchData]);
  
  // --- Event Handlers ---
  
  const handleLogin = (username: string, password: string): boolean => {
    const authenticatedUser = authenticateUser(username, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setAuthError('');
      setIsLoading(true); // Start loading data
      return true;
    }
    setAuthError('Invalid username or password.');
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setEmployees([]);
    setBlockers([]);
    setActivities([]);
    setIsDbLive(false);
  };
  
  const handleOpenModal = (type: ModalState['type'], taskId?: string) => {
    setModalState({ type, taskId });
  };
  
  const handleCloseModal = () => {
    setModalState({ type: null });
  };
  
  const handleApiAction = async (endpoint: string, method: string, body: any, successMessage: string) => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${successMessage.toLowerCase()}`);
      }
      addNotification(successMessage, 'success');
      handleCloseModal();
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error(`API Action Error: ${error.message}`);
      addNotification(`Error: ${error.message}`, 'error');
    }
  };
  
  const handleStatusUpdate = (taskId: string, payload: StatusUpdatePayload) => {
     handleApiAction(`/api/tasks/${taskId}/status-update`, 'POST', payload, 'Status updated successfully!');
  };

  const handleBlockerReport = (taskId: string, payload: BlockerReportPayload) => {
    handleApiAction(`/api/tasks/${taskId}/blocker-report`, 'POST', payload, 'Blocker reported successfully!');
  };
  
  const handleSubmitTask = (taskId: string) => {
    handleApiAction(`/api/tasks/${taskId}/submit`, 'POST', {}, 'Task submitted for review!');
  };
  
  const handleCreateTask = (payload: TaskCreationPayload) => {
    handleApiAction('/api/tasks', 'POST', payload, 'Task created successfully!');
  };
  
  const handleSeedDatabase = async () => {
    try {
      const seedData = {
        tasks: MOCK_TASKS,
        employees: MOCK_EMPLOYEES,
        blockers: MOCK_BLOCKERS,
        activities: MOCK_ACTIVITIES,
        screenshots: MOCK_SCREENSHOTS
      };
      await handleApiAction('/api/seed', 'POST', seedData, 'Sample data has been reset.');
    } catch (error) {
       console.error("Failed to seed database:", error);
    }
  };

  // --- Render Logic ---
  const renderModalContent = () => {
    const { type, taskId } = modalState;
    if (!type || !taskId && (type !== 'taskCreation')) return null;

    const task = tasks.find(t => t.id === taskId);

    switch (type) {
      case 'taskDetail':
        if (!task) return null;
        return <TaskDetailModal task={task} employee={employees.find(e => e.id === task.ownerId)} activities={activities.filter(a => a.taskId === taskId)} />;
      case 'statusUpdate':
        if (!task) return null;
        return <StatusUpdateModal task={task} onClose={handleCloseModal} onUpdate={handleStatusUpdate} />;
      case 'blockerReport':
        if (!task) return null;
        return <BlockerReportModal task={task} onClose={handleCloseModal} onReport={handleBlockerReport} />;
      case 'taskCreation':
         return <TaskCreationModal employees={employees} onClose={handleCloseModal} onCreate={handleCreateTask} />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
      switch (modalState.type) {
          case 'taskDetail': return `Task Details: ${tasks.find(t => t.id === modalState.taskId)?.code}`;
          case 'statusUpdate': return 'Submit Status Update';
          case 'blockerReport': return 'Report a Blocker';
          case 'taskCreation': return 'Create a New Task';
          default: return '';
      }
  };

  if (!user) {
    return <Login onLogin={handleLogin} error={authError} />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white text-xl">Loading Dashboard...</div>;
  }
  
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <div className="bg-dots-pattern">
        {user.role === 'Manager' ? (
          <ManagerView
            user={user}
            tasks={tasks}
            employees={employees}
            blockers={blockers}
            activities={activities}
            onViewDetails={(taskId) => handleOpenModal('taskDetail', taskId)}
            onOpenModal={(type) => handleOpenModal(type)}
            onLogout={handleLogout}
            onSeedDatabase={handleSeedDatabase}
            isDbLive={isDbLive}
          />
        ) : (
          <EmployeeView
            employee={employees.find(e => e.id === user.employeeId)!}
            task={tasks.find(t => t.ownerId === user.employeeId)}
            activities={activities.filter(a => a.employeeId === user.employeeId)}
            onOpenModal={handleOpenModal}
            onSubmitTask={handleSubmitTask}
            onLogout={handleLogout}
          />
        )}

        <Modal
          isOpen={!!modalState.type}
          onClose={handleCloseModal}
          title={getModalTitle()}
        >
          {renderModalContent()}
        </Modal>

        {/* Notification Area */}
        <div className="fixed bottom-4 right-4 w-full max-w-sm space-y-2 z-[100]">
          {notifications.map(n => (
            <Notification key={n.id} {...n} onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
