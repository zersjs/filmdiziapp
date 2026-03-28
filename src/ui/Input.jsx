import React, { useState, useId } from 'react';

const Input = ({
  label,
  icon,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const hasValue = props.value && props.value.length > 0;

  const groupClasses = [
    'sf-input-group',
    focused && 'sf-input-focused',
    hasValue && 'sf-input-filled',
    error && 'sf-input-error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses}>
      {icon && <span className="sf-input-icon">{icon}</span>}
      <input
        id={id}
        type={type}
        className="sf-input"
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {label && <label htmlFor={id} className="sf-input-label">{label}</label>}
      <div className="sf-input-line" />
      {error && <span className="sf-input-error-text">{error}</span>}
    </div>
  );
};

export default Input;
