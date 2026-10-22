import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService, supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const getDisplayName = (user) =>
  user?.user_metadata?.username ||
  user?.user_metadata?.full_name ||
  user?.email?.split('@')[0] ||
  'Kullanıcı';

export const getAvatarUrl = (user) =>
  user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

// Supabase'in İngilizce hata mesajlarını kullanıcıya Türkçe göster.
export const translateAuthError = (error) => {
  const message = error?.message || '';
  const map = [
    [/invalid login credentials/i, 'E-posta veya şifre hatalı.'],
    [/email not confirmed/i, 'E-posta adresinizi henüz doğrulamadınız. Gelen kutunuzu kontrol edin.'],
    [/user already registered/i, 'Bu e-posta adresiyle kayıtlı bir hesap zaten var.'],
    [/password should be at least/i, 'Şifre en az 6 karakter olmalı.'],
    [/rate limit|too many requests/i, 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.'],
    [/unable to validate email|invalid email/i, 'Geçerli bir e-posta adresi girin.'],
    [/supabase not configured/i, 'Üyelik sistemi şu anda yapılandırılmamış.'],
    [/network|fetch/i, 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.'],
  ];
  const match = map.find(([pattern]) => pattern.test(message));
  return match ? match[1] : message || 'Beklenmeyen bir hata oluştu.';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.getSession()
      .then(({ data: { session } }) => {
        if (active) setUser(session?.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isConfigured: !!supabase,
    isAuthenticated: !!user,
    signUp: (email, password, username) => authService.signUp(email, password, username),
    signIn: (email, password) => authService.signIn(email, password),
    signInWithProvider: async (provider) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } };
      return supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
      });
    },
    resetPassword: async (email) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } };
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
    },
    signOut: async () => {
      const { error } = await authService.signOut();
      if (!error) setUser(null);
      return { error };
    },
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
