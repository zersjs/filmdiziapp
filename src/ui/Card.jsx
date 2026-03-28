import React from 'react';

const Card = ({ children, hover = false, padding = true, className = '', ...props }) => {
  const classes = [
    'sf-card',
    hover && 'sf-card-hover',
    padding && 'sf-card-padded',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardMedia = ({ src, alt, aspect = '2/3', overlay, children, className = '', ...props }) => {
  return (
    <div className={`sf-card-media ${className}`} style={{ aspectRatio: aspect }} {...props}>
      <img src={src} alt={alt} loading="lazy" />
      {overlay && <div className="sf-card-media-overlay">{children}</div>}
      {!overlay && children}
    </div>
  );
};

Card.Media = CardMedia;

export default Card;
