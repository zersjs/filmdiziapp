import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Force unregister all service workers if any exist (cleaning up old offline logic)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Unregistered SW:', registration.scope);
    }
  });
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
