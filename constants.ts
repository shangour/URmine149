

import { Employee, Task, Activity, Blocker, TaskStatus, Phase } from './types.ts';

export const EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Vivek', currentTaskId: 'task-1' },
  { id: 'emp-2', name: 'Priya', currentTaskId: 'task-2' },
  { id: 'emp-3', name: 'Amit', currentTaskId: 'task-3' },
  { id: 'emp-4', name: 'Sunita', currentTaskId: null },
  { id: 'emp-5', name: 'Rohan', currentTaskId: null },
  { id: 'emp-6', name: 'Anjali', currentTaskId: null },
  { id: 'emp-7', name: 'Pooja', currentTaskId: null },
];

// FIX: Explicitly typed PHASES_TEMPLATE to avoid type inference issues where `status` becomes `string`.
export const PHASES_TEMPLATE: Phase[] = [
    { name: 'Tutorial Selection', expectedDuration: 60, status: 'Pending', validationStatus: 'Pending' },
    { name: 'PRD Creation', expectedDuration: 120, status: 'Pending', validationStatus: 'Pending' },
    { name: 'Demo Implementation', expectedDuration: 180, status: 'Pending', validationStatus: 'Pending' },
    { name: 'URmine Integration', expectedDuration: 150, status: 'Pending', validationStatus: 'Pending' },
    { name: 'Validation & Deployment', expectedDuration: 90, status: 'Pending', validationStatus: 'Pending' },
];

export const DELIVERABLES_TEMPLATE = [
    { id: 'del-1', type: 'Tutorial Links Compilation', isSubmitted: false },
    { id: 'del-2', type: 'Reverse-Engineered PRD', isSubmitted: false },
    { id: 'del-3', type: 'Demo App URL', isSubmitted: false },
    { id: 'del-4', type: 'URmine Implementation URL', isSubmitted: false },
    { id: 'del-5', type: 'GitHub Repository Link', isSubmitted: false },
];


export const TASKS: Task[] = [
  {
    id: 'task-1',
    code: '09/10/25 URmine Vibe Coding',
    ownerId: 'emp-1',
    manager: 'Shan',
    mentor: 'Indrajeet',
    expectedDuration: 480,
    startTime: Date.now() - 3600000 * 2, // 2 hours ago
    status: 'In Progress',
    progressPercentage: 45,
    currentPhase: 'Demo Implementation',
    lastUpdateTime: Date.now() - 60000 * 18, // 18 mins ago
    complianceScore: 95,
    description: "Implement the real-time monitoring dashboard as per the PRD. Focus on the manager's view and task summary panel.",
    phases: [
      { name: 'Tutorial Selection', expectedDuration: 60, status: 'Completed', validationStatus: 'Approved' },
      { name: 'PRD Creation', expectedDuration: 120, status: 'Completed', validationStatus: 'Approved' },
      { name: 'Demo Implementation', expectedDuration: 180, status: 'In Progress', validationStatus: 'Pending' },
      { name: 'URmine Integration', expectedDuration: 150, status: 'Pending', validationStatus: 'Pending' },
      { name: 'Validation & Deployment', expectedDuration: 90, status: 'Pending', validationStatus: 'Pending' },
    ],
    deliverables: DELIVERABLES_TEMPLATE.map((d, i) => ({...d, isSubmitted: i < 2})),
    dueDate: Date.now() + 3600000 * 6, // 6 hours from now
  },
  {
    id: 'task-2',
    code: '10/10/25 API Integration',
    ownerId: 'emp-2',
    manager: 'Shan',
    mentor: 'Indrajeet',
    expectedDuration: 300,
    startTime: Date.now() - 3600000 * 1, // 1 hour ago
    status: 'Blocked',
    progressPercentage: 20,
    currentPhase: 'PRD Creation',
    lastUpdateTime: Date.now() - 60000 * 45, // 45 mins ago
    complianceScore: 80,
    description: "Integrate with the third-party weather API. The main challenge is handling rate limits and data transformation.",
    phases: [
      { name: 'Tutorial Selection', expectedDuration: 30, status: 'Completed', validationStatus: 'Approved' },
      { name: 'PRD Creation', expectedDuration: 90, status: 'Blocked', validationStatus: 'Pending' },
      { name: 'API Scaffolding', expectedDuration: 120, status: 'Pending', validationStatus: 'Pending' },
      { name: 'Deployment', expectedDuration: 60, status: 'Pending', validationStatus: 'Pending' },
    ],
    deliverables: DELIVERABLES_TEMPLATE.slice(0,4).map((d, i) => ({...d, isSubmitted: i < 1})),
    dueDate: Date.now() + 3600000 * 4, // 4 hours from now
  },
  {
    id: 'task-3',
    code: '11/10/25 UI Polish',
    ownerId: 'emp-3',
    manager: 'Shan',
    mentor: 'Indrajeet',
    expectedDuration: 240,
    startTime: Date.now() - 3600000 * 4, // 4 hours ago
    status: 'Under Review',
    progressPercentage: 100,
    currentPhase: 'Validation & Deployment',
    lastUpdateTime: Date.now() - 60000 * 90, // 90 mins ago
    complianceScore: 99,
    description: "Final UI polish and accessibility improvements. Ensure all components are mobile-responsive and meet WCAG AA standards.",
    phases: PHASES_TEMPLATE.map(p => ({...p, status: 'Completed', validationStatus: 'Approved'})),
    deliverables: DELIVERABLES_TEMPLATE.map(d => ({...d, isSubmitted: true})),
  }
];

export const ACTIVITIES: Activity[] = [
    { id: 'act-1', employeeId: 'emp-1', taskId: 'task-1', timestamp: Date.now() - 60000 * 18, type: 'Status Update', description: 'Finished setting up the main grid component for the manager view.', metadata: { progressPercentage: 45 }, screenshotId: 'scr-1' },
    { id: 'act-2', employeeId: 'emp-1', taskId: 'task-1', timestamp: Date.now() - 60000 * 75, type: 'Phase Completed', description: 'PRD Creation phase is complete and submitted for validation.', metadata: { progressPercentage: 40 } },
    { id: 'act-3', employeeId: 'emp-2', taskId: 'task-2', timestamp: Date.now() - 60000 * 45, type: 'Blocker Reported', description: 'API key is invalid. Cannot proceed with fetching data.', metadata: { blockerSeverity: 'High' }, screenshotId: 'scr-2' },
    { id: 'act-4', employeeId: 'emp-3', taskId: 'task-3', timestamp: Date.now() - 60000 * 90, type: 'Task Submitted', description: 'All phases and deliverables for UI Polish are complete.', metadata: { progressPercentage: 100 } },
];

export const BLOCKERS: Blocker[] = [
    { id: 'blk-1', employeeId: 'emp-2', taskId: 'task-2', title: 'Invalid API credentials', description: 'The provided API key for the weather service is returning a 401 Unauthorized error.', severity: 'High', reportedAt: Date.now() - 60000 * 45, status: 'Open', screenshotId: 'scr-2' }
];

export const SCREENSHOTS = [
    { id: 'scr-1', taskId: 'task-1', employeeId: 'emp-1', timestamp: Date.now() - 60000 * 18, base64Data: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' },
    { id: 'scr-2', taskId: 'task-2', employeeId: 'emp-2', timestamp: Date.now() - 60000 * 45, base64Data: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }
];


export const STATUS_COLORS: { [key in TaskStatus]: { border: string; bg: string; text: string; } } = {
  'In Progress': { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'Completed': { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
  'Blocked': { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
  'Under Review': { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  'Not Started': { border: 'border-gray-600', bg: 'bg-gray-600/10', text: 'text-gray-400' },
};
