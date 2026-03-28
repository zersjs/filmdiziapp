import React from 'react';

const Skeleton = ({ width, height, radius = 'md', className = '', ...props }) => {
  const radiusMap = { sm: '6px', md: '10px', lg: '14px', full: '9999px' };

  return (
    <div
      className={`sf-skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: radiusMap[radius] || radius,
      }}
      {...props}
    />
  );
};

const SkeletonCard = ({ aspect = '2/3' }) => (
  <div className="sf-skeleton-card" style={{ aspectRatio: aspect }}>
    <div className="sf-skeleton sf-skeleton-fill" />
  </div>
);

Skeleton.Card = SkeletonCard;

export default Skeleton;
