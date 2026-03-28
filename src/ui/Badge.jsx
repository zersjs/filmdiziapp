import React from 'react';

const variants = {
  default: 'sf-badge-default',
  accent: 'sf-badge-accent',
  success: 'sf-badge-success',
  warning: 'sf-badge-warning',
  danger: 'sf-badge-danger',
  outline: 'sf-badge-outline',
};

const Badge = ({ children, variant = 'default', icon, className = '', ...props }) => {
  const classes = ['sf-badge', variants[variant], className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className="sf-badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
