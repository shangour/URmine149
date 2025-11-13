
import React, { useState, useRef } from 'react';
import { Attachment } from '../types.ts';
import { PaperclipIcon } from './icons.tsx';

interface FileUploadProps {
  onFileUpload: (file: Attachment | undefined) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileUpload({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
        });
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileUpload(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
      />
      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-600 rounded-md text-sm font-medium text-gray-400 hover:border-gray-500"
        >
          <PaperclipIcon className="w-5 h-5 mr-2" />
          Attach a file (.doc, .pdf, .png, etc.)
        </button>
      ) : (
        <div className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
            <div className="flex items-center truncate">
                <PaperclipIcon className="w-5 h-5 mr-2 text-gray-300 flex-shrink-0" />
                <span className="text-white truncate">{selectedFile.name}</span>
            </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-gray-400 hover:text-white ml-2"
            aria-label="Remove file"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
