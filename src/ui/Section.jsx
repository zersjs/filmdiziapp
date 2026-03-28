import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, icon, badge, viewAllLink, viewAllText = 'Tümünü Gör', children, className = '' }) => {
  return (
    <section className={`sf-section ${className}`}>
      <div className="sf-section-header">
        <h2 className="sf-section-title">
          {icon && <span className="sf-section-icon">{icon}</span>}
          <span>{title}</span>
          {badge && <span className="sf-section-badge">{badge}</span>}
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="sf-section-link">
            {viewAllText} <span className="sf-section-arrow">&rarr;</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
};

export default Section;
