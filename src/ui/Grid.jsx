import React from 'react';

const Grid = ({ children, cols = 'auto', gap = 'default', className = '', ...props }) => {
  const colsMap = {
    auto: 'sf-grid-auto',
    2: 'sf-grid-2',
    3: 'sf-grid-3',
    4: 'sf-grid-4',
    5: 'sf-grid-5',
    6: 'sf-grid-6',
  };

  const gapMap = {
    tight: 'sf-grid-gap-tight',
    default: 'sf-grid-gap-default',
    loose: 'sf-grid-gap-loose',
  };

  const classes = [
    'sf-grid',
    colsMap[cols] || colsMap.auto,
    gapMap[gap] || gapMap.default,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Grid;
