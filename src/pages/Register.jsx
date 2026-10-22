import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaEnvelopeOpenText } from 'react-icons/fa';
import { useAuth, translateAuthError } from '../contexts/AuthContext';
import AuthShell, { Field, GoogleButton, PasswordField } from '../components/Auth/AuthShell';

const MIN_PASSWORD = 6;

const Register = () => {
  const { signUp, signInWithProvider, isConfigured } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (key) => (event) => setForm(prev => ({ ...prev, [key]: event.target.value }));
  const checks = [
    { ok: form.password.length >= MIN_PASSWORD, label: `En az ${MIN_PASSWORD} karakter` },
    { ok: form.confirm.length > 0 && form.password === form.confirm, label: 'Şifreler eşleşiyor' },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password.length < MIN_PASSWORD) {
      setError(`Şifre en az ${MIN_PASSWORD} karakter olmalı.`);
      return;
    }
    if (form.password !== form.confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: signUpError } = await signUp(form.email.trim(), form.password, form.username.trim());
    setLoading(false);
    if (signUpError) {
      setError(translateAuthError(signUpError));
      return;
    }
    setSuccess(true);
  };

  const handleGoogle = async () => {
    setError('');
    const { error: oauthError } = await signInWithProvider('google');
    if (oauthError) setError(translateAuthError(oauthError));
  };

  if (success) {
    return (
      <AuthShell pageTitle="Kayıt başarılı" title="E-postanı kontrol et">
        <div className="mt-4 text-center">
          <div className="empty-state-icon mx-auto"><FaEnvelopeOpenText /></div>
          <p className="text-sm leading-relaxed text-white/60">
            <strong className="text-white">{form.email}</strong> adresine bir doğrulama bağlantısı gönderdik.
            Bağlantıya tıkladıktan sonra giriş yapabilirsin.
          </p>
          <Link to="/login" className="btn btn-primary btn-block mt-6">Giriş sayfasına git</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell pageTitle="Kayıt ol" title="Hesap oluştur" subtitle="Ücretsiz hesabını birkaç saniyede oluştur.">
      {!isConfigured && (
        <div className="auth-notice">Üyelik sistemi şu anda yapılandırılmamış.</div>
      )}
      {error && <div className="auth-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="username" label="Kullanıcı adı" autoComplete="username" value={form.username} onChange={update('username')} required minLength={2} maxLength={32} />
        <Field id="email" label="E-posta" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={update('email')} required />
        <PasswordField id="password" label="Şifre" autoComplete="new-password" value={form.password} onChange={update('password')} required />
        <PasswordField id="confirm" label="Şifre (tekrar)" autoComplete="new-password" value={form.confirm} onChange={update('confirm')} required />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {checks.map(check => (
            <li key={check.label} className={`flex items-center gap-1.5 ${check.ok ? 'text-green-400' : 'text-white/35'}`}>
              <FaCheck className="text-[9px]" /> {check.label}
            </li>
          ))}
        </ul>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || !isConfigured}>
          {loading ? 'Hesap oluşturuluyor…' : 'Kayıt ol'}
        </button>
      </form>

      <div className="auth-divider">veya</div>
      <GoogleButton onClick={handleGoogle} disabled={!isConfigured} label="Google ile kayıt ol" />

      <p className="mt-6 text-center text-xs leading-relaxed text-white/35">
        Kayıt olarak <Link to="/kullanim-kosullari" className="underline">kullanım koşullarını</Link> ve{' '}
        <Link to="/gizlilik-politikasi" className="underline">gizlilik politikasını</Link> kabul etmiş olursun.
      </p>
      <p className="mt-4 text-center text-sm text-white/45">
        Zaten hesabın var mı? <Link to="/login" className="font-semibold text-white hover:underline">Giriş yap</Link>
      </p>
    </AuthShell>
  );
};

export default Register;
