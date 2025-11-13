import React, { useState } from 'react';
import { Employee, TaskCreationPayload, Attachment } from '../types.ts';
import FileUpload from './FileUpload.tsx';

interface TaskCreationModalProps {
  employees: Employee[];
  onClose: () => void;
  onCreate: (payload: TaskCreationPayload) => void;
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ employees, onClose, onCreate }) => {
  const [ownerId, setOwnerId] = useState<string>('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId) {
        setError('You must assign the task to an employee.');
        return;
    }
    setError('');

    const payload: TaskCreationPayload = {
      ownerId,
      code,
      description,
      attachment,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    };
    onCreate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="assignTo" className="block text-sm font-medium text-gray-300 mb-1">
          Assign To (Required)
        </label>
        <select
          id="assignTo"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="" disabled>Select an employee</option>
          {employees
            .filter(emp => emp && emp.id && emp.name)
            .map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
         {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
      
      <div>
        <label htmlFor="taskCode" className="block text-sm font-medium text-gray-300 mb-1">
          Task Code / Title
        </label>
        <input
          type="text"
          id="taskCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="e.g., 12/10/25 Marketing Campaign"
          required
        />
      </div>

       <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Task Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="Provide detailed instructions for the task."
          required
        />
      </div>
      
       <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">
          Due Date / Alarm (Optional)
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
        />
      </div>

       <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Attach Document (Optional)
        </label>
        <FileUpload onFileUpload={setAttachment} />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskCreationModal;