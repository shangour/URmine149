
export type Role = 'Manager' | 'Employee';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Under Review' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';
export type BlockerSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
}

export interface Task {
  id: string;
  code: string;
  ownerId: string;
  manager: string;
  mentor: string;
  expectedDuration: number; // In minutes
  startTime: number; // Unix timestamp
  status: TaskStatus;
  progressPercentage: number;
  currentPhase: string;
  phases: Phase[];
  deliverables: Deliverable[];
  complianceScore: number;
  lastUpdateTime: number;
  description: string;
  attachment?: Attachment;
  dueDate?: number; // Unix timestamp for alarm
}

export interface Phase {
  name: string;
  expectedDuration: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked' | 'Under Review';
  validationStatus: 'Pending' | 'Approved' | 'Rejected';
}

export interface Deliverable {
  id: string;
  type: string;
  isSubmitted: boolean;
}

export interface Employee {
  id: string;
  name: string;
  currentTaskId: string | null;
}

export interface Activity {
  id: string;
  employeeId: string;
  taskId: string;
  timestamp: number;
  type: 'Check-in' | 'Status Update' | 'Blocker Reported' | 'Screenshot Upload' | 'Phase Completed' | 'Task Submitted';
  description: string;
  screenshotId?: string;
  metadata?: {
    progressPercentage?: number;
    blockerSeverity?: BlockerSeverity;
  };
}

export interface Screenshot {
  id: string;
  taskId: string;
  employeeId: string;
  timestamp: number;
  base64Data: string;
}

export interface Blocker {
  id: string;
  taskId: string;
  employeeId: string;
  title: string;
  description: string;
  severity: BlockerSeverity;
  reportedAt: number;
  screenshotId: string;
  status: 'Open' | 'Resolved';
}

export interface ModalState {
  type: ModalType | null;
  taskId?: string;
}

export type ModalType = 'taskDetail' | 'statusUpdate' | 'blockerReport' | 'taskCreation';


// Form Payloads
export interface StatusUpdatePayload {
    progressPercentage: number;
    activityText: string;
    blockersText: string;
    screenshotData: string;
}

export interface BlockerReportPayload {
    title: string;
    description: string;
    severity: BlockerSeverity;
    screenshotData: string;
}

export interface TaskCreationPayload {
  ownerId: string;
  code: string;
  description: string;
  attachment?: Attachment;
  dueDate?: number;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// User Authentication
export interface User {
    username: string;
    name: string;
    role: Role;
    employeeId: string | null; // Link to employee record if role is Employee
}
