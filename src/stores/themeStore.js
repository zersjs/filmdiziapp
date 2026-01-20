import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', 
      actualTheme: 'dark', 

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      applyTheme: (theme) => {
        let actualTheme = theme;

        if (theme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          actualTheme = prefersDark ? 'dark' : 'light';
        }

        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(actualTheme);
        document.documentElement.setAttribute('data-theme', actualTheme);

        set({ actualTheme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      initTheme: () => {
        const { theme } = get();
        get().applyTheme(theme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (get().theme === 'auto') {
            get().applyTheme('auto');
          }
        });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
