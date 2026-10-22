import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

export const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
};

export const useEscapeKey = (active, onEscape) => {
  const handler = useRef(onEscape);
  handler.current = onEscape;

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handler.current?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
};

const sizeClasses = {
  small: 'max-w-md',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'medium', className = '' }) => {
  const panelRef = useRef(null);

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    panelRef.current?.focus();
    return () => previousFocus?.focus?.();
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal-panel ${sizeClasses[size] || sizeClasses.medium} ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between gap-4 px-5 pt-5">
            <h2 className="text-lg font-bold">{title}</h2>
            <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Kapat">
              <FaTimes />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Onay',
  message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
  confirmText = 'Evet',
  cancelText = 'Vazgeç',
  type = 'danger',
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
    <p className="text-sm leading-relaxed text-white/70">{message}</p>
    <div className="mt-6 flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
      <button type="button" onClick={onClose} className="btn btn-ghost">
        {cancelText}
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
      >
        {confirmText}
      </button>
    </div>
  </Modal>
);

export default Modal;
