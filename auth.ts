import { User } from './types.ts';

// This is a hardcoded list of users to simulate a user database.
// In a real application, this data would come from a secure database.
export const USERS: User[] = [
  {
    username: 'manager',
    name: 'Shan (Manager)',
    role: 'Manager',
    employeeId: null, // Managers are not employees in this data model
  },
  {
    username: 'vivek',
    name: 'Vivek',
    role: 'Employee',
    employeeId: 'emp-1',
  },
  {
    username: 'priya',
    name: 'Priya',
    role: 'Employee',
    employeeId: 'emp-2',
  },
  {
    username: 'amit',
    name: 'Amit',
    role: 'Employee',
    employeeId: 'emp-3',
  },
  {
    username: 'sunita',
    name: 'Sunita',
    role: 'Employee',
    employeeId: 'emp-4',
  },
  {
    username: 'rohan',
    name: 'Rohan',
    role: 'Employee',
    employeeId: 'emp-5',
  },
  {
    username: 'anjali',
    name: 'Anjali',
    role: 'Employee',
    employeeId: 'emp-6',
  }
];

// Simple authentication function.
// In a real app, this would be a backend API call that validates against a hashed password.
export const authenticateUser = (username: string, password: string): User | undefined => {
  // For this demo, we'll use a single password for everyone for simplicity.
  const DEMO_PASSWORD = 'password123';
  const user = USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (user && password === DEMO_PASSWORD) {
    return user;
  }
  
  return undefined;
};