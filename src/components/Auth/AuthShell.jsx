import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaBookmark, FaHeart, FaPlay, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import Logo from '../UI/Logo';

const FEATURES = [
  { icon: FaBookmark, text: 'İzleme listeni oluştur, hiçbir şeyi kaçırma' },
  { icon: FaHeart, text: 'Sahneleri beğen, kaydet ve yorum yap' },
  { icon: FaPlay, text: 'Kaldığın bölümden izlemeye devam et' },
];

const AuthShell = ({ pageTitle, title, subtitle, children }) => (
  <>
    <Helmet>
      <title>{pageTitle} - SINEFIX</title>
    </Helmet>
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-branding">
          <div className="mb-10 flex items-center gap-3 text-lg font-extrabold tracking-[0.06em]">
            <Logo size={26} /> SINEFIX
          </div>
          <h2 className="text-[28px] font-bold leading-tight tracking-tight">Film ve dizi dünyasına hoş geldin</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Hesabınla etkileşimlerin kaydedilir; favorilerin ve izleme listen her zaman elinin altında olur.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs">
                  <Icon />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-inner">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mb-6 mt-1 text-sm text-white/45">{subtitle}</p>}
            {children}
          </div>
        </div>
      </div>
    </div>
  </>
);

export const Field = ({ id, label, ...props }) => (
  <div>
    <label htmlFor={id} className="field-label">{label}</label>
    <input id={id} className="input" {...props} />
  </div>
);

export const PasswordField = ({ id, label, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} className="input !pr-12" {...props} />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="icon-btn password-toggle !h-9 !w-9 text-sm"
          aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

export const GoogleButton = ({ onClick, disabled, label = 'Google ile devam et' }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="btn btn-secondary btn-block">
    <FaGoogle className="text-sm" /> {label}
  </button>
);

export default AuthShell;
