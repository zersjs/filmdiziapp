import React from 'react';
import { Link } from 'react-router-dom';

// Görünür içerik haritası. Aynı liste BreadcrumbList JSON-LD olarak da basılır (lib/seo.js).
// hideCurrent: sayfa başlığı hemen altında h1 olarak yazıyorsa son öğe tekrar edilmez.
const Breadcrumbs = ({ items, className = '', hideCurrent = false }) => {
  const visible = hideCurrent ? items?.slice(0, -1) : items;
  if (!visible?.length) return null;
  return (
    <nav aria-label="İçerik konumu" className={`breadcrumbs ${className}`}>
      <ol>
        {visible.map((item, index) => {
          const last = !hideCurrent && index === visible.length - 1;
          return (
            <li key={item.path}>
              {last ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
