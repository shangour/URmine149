

import React from 'react';

interface NotificationProps {
  message: string;
  // FIX: Added 'warning' to the list of accepted types to match the main Notification type.
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    // FIX: Added style for the 'warning' type.
    warning: 'bg-yellow-500',
  }[type];

  // FIX: Removed `fixed` and related positioning classes. The parent container in App.tsx handles positioning.
  // This allows multiple notifications to stack vertically as intended. Also added flex for better alignment.
  return (
    <div className={`p-4 rounded-lg text-white ${bgColor} shadow-lg flex items-center justify-between`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">X</button>
    </div>
  );
};

export default Notification;