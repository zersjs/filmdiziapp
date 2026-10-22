import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Bellek içi localStorage: testler gerçek okuma/yazma davranışını doğrulayabilsin.
const createStorage = () => {
  let store = new Map();
  return {
    getItem: vi.fn(key => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => { store.set(key, String(value)); }),
    removeItem: vi.fn(key => { store.delete(key); }),
    clear: vi.fn(() => { store = new Map(); }),
  };
};

Object.defineProperty(window, 'localStorage', { configurable: true, value: createStorage() });
