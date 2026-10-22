import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, translateAuthError } from '../contexts/AuthContext';
import AuthShell, { Field } from '../components/Auth/AuthShell';

const ForgotPassword = () => {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);
    if (resetError) {
      setError(translateAuthError(resetError));
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      pageTitle="Şifremi unuttum"
      title="Şifreni sıfırla"
      subtitle={sent ? undefined : 'Hesabına kayıtlı e-posta adresini yaz; sıfırlama bağlantısı gönderelim.'}
    >
      {sent ? (
        <div className="mt-4">
          <div className="auth-notice">
            Hesap varsa <strong className="text-white">{email}</strong> adresine bir sıfırlama bağlantısı gönderildi.
            Gelen kutunu (ve spam klasörünü) kontrol et.
          </div>
          <Link to="/login" className="btn btn-primary btn-block">Giriş sayfasına dön</Link>
        </div>
      ) : (
        <>
          {!isConfigured && <div className="auth-notice">Üyelik sistemi şu anda yapılandırılmamış.</div>}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="email" label="E-posta" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || !isConfigured}>
              {loading ? 'Gönderiliyor…' : 'Sıfırlama bağlantısı gönder'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/45">
            <Link to="/login" className="font-semibold text-white hover:underline">Giriş sayfasına dön</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
