import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, refresh the page
              if (confirm('Yeni sürüm mevcut! Sayfayı yenilemek ister misiniz?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button or banner
  showInstallPromotion();
});

function showInstallPromotion() {
  // Create install button if it doesn't exist
  if (!document.getElementById('install-button')) {
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = '📱 Uygulamayı Yükle';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #000 0%, #333 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    `;
    
    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
    });
    
    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    });
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.remove();
      }
    });
    
    document.body.appendChild(installButton);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (installButton && installButton.parentNode) {
        installButton.style.opacity = '0';
        setTimeout(() => {
          if (installButton && installButton.parentNode) {
            installButton.remove();
          }
        }, 300);
      }
    }, 10000);
  }
}

// Handle app installation
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed');
  // Remove install button if it exists
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.remove();
  }
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('App is online');
  // You could show a toast notification here
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  // You could show an offline indicator here
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
