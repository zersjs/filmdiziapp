import React, { useState, useEffect, createContext, useContext } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAllToasts } = context;

  return {
    toast: {
      success: (message, duration) => addToast(message, 'success', duration),
      error: (message, duration) => addToast(message, 'error', duration),
      warning: (message, duration) => addToast(message, 'warning', duration),
      info: (message, duration) => addToast(message, 'info', duration),
    },
    removeToast,
    clearAllToasts
  };
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 300);
  };

  const getToastStyles = () => {
    const baseStyles = 'flex items-center p-4 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-900/90 border-green-700 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/90 border-red-700 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/90 border-yellow-700 text-yellow-100`;
      default:
        return `${baseStyles} bg-blue-900/90 border-blue-700 text-blue-100`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheck className="text-green-400" />;
      case 'error':
        return <FaTimes className="text-red-400" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-400" />;
      default:
        return <FaInfoCircle className="text-blue-400" />;
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={getToastStyles()}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 text-sm font-medium">
          {toast.message}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
};
