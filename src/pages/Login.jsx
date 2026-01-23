import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaPlay } from 'react-icons/fa';
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
  const [focusedField, setFocusedField] = useState(null);

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

      <div className="auth-modern-page">
        {/* Background Effect */}
        <div className="auth-bg-effect">
          <div className="auth-bg-gradient" />
          <div className="auth-bg-grid" />
        </div>

        <div className="auth-modern-container">
          {/* Left Side - Branding */}
          <div className="auth-branding">
            <div className="auth-branding-content">
              <div className="auth-logo">
                <FaPlay className="auth-logo-icon" />
                <span className="auth-logo-text">SineFix</span>
              </div>
              <h2 className="auth-branding-title">Film ve Dizi Dünyasına Hoş Geldin</h2>
              <p className="auth-branding-desc">
                Binlerce film ve dizi seni bekliyor. Favorilerini kaydet, izleme listeleri oluştur ve eğlenceye başla!
              </p>
              <div className="auth-features">
                <div className="auth-feature">
                  <span className="auth-feature-icon">🎬</span>
                  <span>Sınırsız İçerik</span>
                </div>
                <div className="auth-feature">
                  <span className="auth-feature-icon">❤️</span>
                  <span>Favoriler</span>
                </div>
                <div className="auth-feature">
                  <span className="auth-feature-icon">📱</span>
                  <span>Her Cihazda</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-side">
            <div className="auth-form-container">
              <div className="auth-form-header">
                <h1>Giriş Yap</h1>
                <p>Hesabınıza giriş yapın</p>
              </div>

              {error && (
                <div className="auth-error-modern">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className={`auth-input-group ${focusedField === 'email' ? 'focused' : ''} ${email ? 'has-value' : ''}`}>
                  <FaEnvelope className="auth-input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <label htmlFor="email">E-posta Adresi</label>
                  <div className="auth-input-line" />
                </div>

                <div className={`auth-input-group ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
                  <FaLock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <label htmlFor="password">Şifre</label>
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className="auth-input-line" />
                </div>

                <div className="auth-options">
                  <label className="auth-remember">
                    <input type="checkbox" />
                    <span className="auth-checkbox" />
                    <span>Beni hatırla</span>
                  </label>
                  <Link to="/forgot-password" className="auth-forgot">Şifremi Unuttum</Link>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="auth-loading">
                      <span className="auth-loading-spinner" />
                      Giriş Yapılıyor...
                    </span>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </form>

              <div className="auth-divider">
                <span>veya</span>
              </div>

              <div className="auth-social-buttons">
                <button 
                  className="auth-social-btn google full-width"
                  onClick={() => handleSocialLogin('google')}
                >
                  <FaGoogle />
                  <span>Google ile Giriş Yap</span>
                </button>
              </div>

              <p className="auth-switch">
                Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
