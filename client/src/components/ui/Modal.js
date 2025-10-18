import React from 'react';
import { XIcon } from '@heroicons/react/outline';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <XIcon className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
