import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) setError(error.message);
  };

  return (
    <>
      <Helmet>
        <title>Giriş Yap | SineFix</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz</h1>
            <p className="text-gray-500">Hesabınıza giriş yapın</p>
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-900/30 text-red-500 p-4 rounded mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="email"
                placeholder="E-posta"
                className="w-full bg-black border border-[#222] text-white rounded px-12 py-3 focus:outline-none focus:border-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                className="w-full bg-black border border-[#222] text-white rounded px-12 py-3 focus:outline-none focus:border-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-4" disabled={loading}>
              {loading ? 'Yükleniyor...' : 'GİRİŞ YAP'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-grow h-px bg-[#1a1a1a]" />
            <span className="text-xs text-gray-600">VEYA</span>
            <div className="flex-grow h-px bg-[#1a1a1a]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className="btn-secondary py-3 flex items-center justify-center gap-2 text-xs"
              onClick={() => handleSocialLogin('google')}
            >
              <FaGoogle /> GOOGLE
            </button>
            <button 
              className="btn-secondary py-3 flex items-center justify-center gap-2 text-xs"
              onClick={() => handleSocialLogin('github')}
            >
              <FaGithub /> GITHUB
            </button>
          </div>

          <p className="text-center mt-10 text-sm text-gray-500">
            Hesabınız yok mu? <Link to="/register" className="text-white hover:underline">Kayıt Olun</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
