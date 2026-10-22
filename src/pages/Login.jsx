import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, translateAuthError } from '../contexts/AuthContext';
import { useToast } from '../components/UI/Toast';
import AuthShell, { Field, GoogleButton, PasswordField } from '../components/Auth/AuthShell';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithProvider, isAuthenticated, isConfigured } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const redirectTo = location.state?.from || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(translateAuthError(signInError));
      return;
    }
    toast.success('Hoş geldin!');
    navigate(redirectTo, { replace: true });
  };

  const handleGoogle = async () => {
    setError('');
    const { error: oauthError } = await signInWithProvider('google');
    if (oauthError) setError(translateAuthError(oauthError));
  };

  return (
    <AuthShell pageTitle="Giriş yap" title="Giriş yap" subtitle="Hesabına giriş yaparak devam et.">
      {!isConfigured && (
        <div className="auth-notice">Üyelik sistemi şu anda yapılandırılmamış. Favorilerin ve izleme listen yine de bu cihazda saklanır.</div>
      )}
      {error && <div className="auth-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="email"
          label="E-posta"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordField
          id="password"
          label="Şifre"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-white/50 hover:text-white">Şifreni mi unuttun?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || !isConfigured}>
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>

      <div className="auth-divider">veya</div>
      <GoogleButton onClick={handleGoogle} disabled={!isConfigured} />

      <p className="mt-6 text-center text-sm text-white/45">
        Hesabın yok mu? <Link to="/register" state={location.state} className="font-semibold text-white hover:underline">Kayıt ol</Link>
      </p>
    </AuthShell>
  );
};

export default Login;
