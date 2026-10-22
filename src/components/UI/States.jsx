import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

export const EmptyState = ({ icon: Icon, title, description, children }) => (
  <div className="empty-state">
    {Icon && (
      <div className="empty-state-icon">
        <Icon />
      </div>
    )}
    {title && <h2>{title}</h2>}
    {description && <p>{description}</p>}
    {children}
  </div>
);

export const ErrorState = ({
  title = 'İçerik yüklenemedi',
  description = 'Bağlantınızı kontrol edip tekrar deneyin.',
  onRetry,
}) => (
  <EmptyState icon={FaExclamationTriangle} title={title} description={description}>
    {onRetry && (
      <button type="button" onClick={() => onRetry()} className="btn btn-secondary">
        <FaRedo className="text-xs" /> Tekrar dene
      </button>
    )}
  </EmptyState>
);
