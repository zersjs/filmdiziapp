import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ToastContext = createContext(null);

const ICONS = {
  success: FaCheck,
  error: FaTimes,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

const MAX_TOASTS = 3;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const add = useCallback((message, type = 'info', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => {
      // Aynı mesaj art arda gelirse çoğaltma
      const rest = prev.filter(t => t.message !== message);
      return [...rest, { id, message, type }].slice(-MAX_TOASTS);
    });
    if (duration > 0) timers.current.set(id, setTimeout(() => remove(id), duration));
    return id;
  }, [remove]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({
    toast: {
      success: (message, duration) => add(message, 'success', duration),
      error: (message, duration) => add(message, 'error', duration),
      warning: (message, duration) => add(message, 'warning', duration),
      info: (message, duration) => add(message, 'info', duration),
    },
    removeToast: remove,
  }), [add, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map(({ id, message, type, leaving }) => {
          const Icon = ICONS[type] || FaInfoCircle;
          return (
            <div key={id} className={`toast ${type} ${leaving ? 'leaving' : ''}`}>
              <Icon className="toast-icon" />
              <span className="flex-1">{message}</span>
              <button
                type="button"
                onClick={() => remove(id)}
                className="text-white/40 hover:text-white p-1 -m-1"
                aria-label="Bildirimi kapat"
              >
                <FaTimes size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
