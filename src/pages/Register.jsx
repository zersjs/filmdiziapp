import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 6,
    match: password === confirmPassword && confirmPassword.length > 0
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signUp(email, password, username);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
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

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-success">
            <FaCheck className="auth-success-icon" />
            <h2>Kayıt Başarılı!</h2>
            <p>E-posta adresine bir doğrulama linki gönderdik. Lütfen e-postanı kontrol et.</p>
            <Link to="/login" className="auth-submit">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Kayıt Ol | SineFix</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Hesap Oluştur</h1>
            <p className="text-gray-500">Ücretsiz kayıt olun</p>
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-900/30 text-red-500 p-4 rounded mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                className="w-full bg-black border border-[#222] text-white rounded px-12 py-3 focus:outline-none focus:border-gray-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

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

            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifreyi Onayla"
                className="w-full bg-black border border-[#222] text-white rounded px-12 py-3 focus:outline-none focus:border-gray-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className={`flex items-center gap-2 text-xs uppercase tracking-widest ${passwordChecks.length ? 'text-white' : 'text-gray-600'}`}>
                {passwordChecks.length ? <FaCheck /> : <FaTimes />}
                <span>Min 6 Karakter</span>
              </div>
              <div className={`flex items-center gap-2 text-xs uppercase tracking-widest ${passwordChecks.match ? 'text-white' : 'text-gray-600'}`}>
                {passwordChecks.match ? <FaCheck /> : <FaTimes />}
                <span>Şifreler Eşleşiyor</span>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-4" disabled={loading}>
              {loading ? 'Yükleniyor...' : 'KAYIT OL'}
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
            Hesabınız var mı? <Link to="/login" className="text-white hover:underline">Giriş Yapın</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
