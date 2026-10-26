import React from 'react';
import { indicatorStyle, useIndicator } from '../../hooks/useIndicator';

// Seçili seçeneğin arkasında kayan kutu olan segment kontrolü (radio grubu).
// Ok tuşlarıyla gezilir; yalnızca seçili seçenek sekme sırasındadır.
const Segmented = ({ options, value, onChange, ariaLabel, className = '' }) => {
  const [ref, rect, animate] = useIndicator(`[data-value="${value}"]`);

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = options.findIndex(option => option.value === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    ref.current?.querySelector(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div ref={ref} role="radiogroup" aria-label={ariaLabel} className={`segmented ${className}`} onKeyDown={onKeyDown}>
      <span className="segmented-thumb" style={indicatorStyle(rect, animate)} aria-hidden="true" />
      {options.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            data-value={option.value}
            className={active ? 'active' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count !== undefined && <span className="segmented-count">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default Segmented;
