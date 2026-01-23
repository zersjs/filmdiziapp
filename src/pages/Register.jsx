import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle, FaCheck, FaTimes, FaPlay } from 'react-icons/fa';
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
  const [focusedField, setFocusedField] = useState(null);

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
      <>
        <Helmet>
          <title>Kayıt Başarılı | SineFix</title>
        </Helmet>
        <div className="auth-modern-page">
          <div className="auth-bg-effect">
            <div className="auth-bg-gradient" />
            <div className="auth-bg-grid" />
          </div>
          <div className="auth-success-container">
            <div className="auth-success-card">
              <div className="auth-success-icon-wrap">
                <FaCheck className="auth-success-icon" />
              </div>
              <h2>Kayıt Başarılı!</h2>
              <p>E-posta adresine bir doğrulama linki gönderdik. Lütfen e-postanı kontrol et ve hesabını doğrula.</p>
              <Link to="/login" className="auth-submit-btn">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Kayıt Ol | SineFix</title>
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
              <h2 className="auth-branding-title">Sinema Deneyimine Katıl</h2>
              <p className="auth-branding-desc">
                Ücretsiz hesap oluştur ve film dünyasının kapılarını aç. Kişiselleştirilmiş öneriler, izleme listeleri ve daha fazlası!
              </p>
              <div className="auth-features">
                <div className="auth-feature">
                  <span className="auth-feature-icon">✨</span>
                  <span>Ücretsiz Üyelik</span>
                </div>
                <div className="auth-feature">
                  <span className="auth-feature-icon">🎯</span>
                  <span>Kişisel Öneriler</span>
                </div>
                <div className="auth-feature">
                  <span className="auth-feature-icon">📝</span>
                  <span>İzleme Listesi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-side">
            <div className="auth-form-container">
              <div className="auth-form-header">
                <h1>Hesap Oluştur</h1>
                <p>Hemen ücretsiz kayıt ol</p>
              </div>

              {error && (
                <div className="auth-error-modern">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className={`auth-input-group ${focusedField === 'username' ? 'focused' : ''} ${username ? 'has-value' : ''}`}>
                  <FaUser className="auth-input-icon" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <label htmlFor="username">Kullanıcı Adı</label>
                  <div className="auth-input-line" />
                </div>

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

                <div className={`auth-input-group ${focusedField === 'confirmPassword' ? 'focused' : ''} ${confirmPassword ? 'has-value' : ''}`}>
                  <FaLock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <label htmlFor="confirmPassword">Şifre Tekrar</label>
                  <div className="auth-input-line" />
                </div>

                {/* Password Checks */}
                <div className="auth-password-checks">
                  <div className={`auth-check ${passwordChecks.length ? 'valid' : ''}`}>
                    {passwordChecks.length ? <FaCheck /> : <FaTimes />}
                    <span>En az 6 karakter</span>
                  </div>
                  <div className={`auth-check ${passwordChecks.match ? 'valid' : ''}`}>
                    {passwordChecks.match ? <FaCheck /> : <FaTimes />}
                    <span>Şifreler eşleşiyor</span>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="auth-loading">
                      <span className="auth-loading-spinner" />
                      Kayıt Yapılıyor...
                    </span>
                  ) : (
                    'Kayıt Ol'
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
                  <span>Google ile Kayıt Ol</span>
                </button>
              </div>

              <p className="auth-switch">
                Hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
