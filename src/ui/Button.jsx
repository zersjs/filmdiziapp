import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: 'sf-btn-primary',
  secondary: 'sf-btn-secondary',
  ghost: 'sf-btn-ghost',
  danger: 'sf-btn-danger',
  icon: 'sf-btn-icon',
};

const sizes = {
  sm: 'sf-btn-sm',
  md: 'sf-btn-md',
  lg: 'sf-btn-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = [
    'sf-btn',
    variants[variant],
    sizes[size],
    fullWidth && 'sf-btn-full',
    loading && 'sf-btn-loading',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading && <span className="sf-btn-spinner" />}
      {icon && !loading && <span className="sf-btn-icon-left">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="sf-btn-icon-right">{iconRight}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
};

export default Button;
