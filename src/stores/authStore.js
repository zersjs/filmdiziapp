import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import authAPI from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        if (token) {
          Cookies.set('token', token, { expires: 7 });
          localStorage.setItem('token', token);
        } else {
          Cookies.remove('token');
          localStorage.removeItem('token');
        }
        set({ token });
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response;

          get().setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });

          return { success: true, user };
        } catch (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          return { success: false, error: error.message };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          const { user, token } = response;

          get().setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });

          return { success: true, user };
        } catch (error) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().setToken(null);
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      loadUser: async () => {
        const token = Cookies.get('token') || localStorage.getItem('token');

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          get().setToken(null);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates },
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
