import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, username) => {
    const { data, error } = await authService.signUp(email, password, username);
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) setUser(null);
    return { error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
