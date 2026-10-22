import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Eski sürümlerden kalan service worker'ları kaldır (offline önbellek eski dosyaları sunmasın).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => registrations.forEach((registration) => registration.unregister()))
    .catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
