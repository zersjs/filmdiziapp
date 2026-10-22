import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaPaperPlane, FaQuestionCircle } from 'react-icons/fa';

const CONTACT_EMAIL = 'info@sinefix.com';

const SUBJECTS = ['Öneri', 'Hata bildirimi', 'İçerik sorunu', 'Hesap', 'Diğer'];

// Sunucu tarafı olmadığından mesaj, kullanıcının e-posta uygulamasında hazır olarak açılır.
const Contact = () => {
  const [form, setForm] = useState({ name: '', subject: SUBJECTS[0], message: '' });
  const update = (key) => (event) => setForm(prev => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = `[SINEFIX] ${form.subject}`;
    const body = `${form.message}\n\n— ${form.name}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <Helmet>
        <title>İletişim - SINEFIX</title>
        <meta name="description" content="SINEFIX ile iletişime geçin: öneri, hata bildirimi ve sorularınız için." />
      </Helmet>

      <div className="page container-custom max-w-3xl">
        <h1 className="page-title">İletişim</h1>
        <p className="page-subtitle">Öneri, hata bildirimi veya sorularını bize ilet.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="surface flex items-center gap-4 p-4 hover:border-white/15">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]"><FaEnvelope /></span>
            <span>
              <span className="block text-xs text-white/45">E-posta</span>
              <span className="font-semibold">{CONTACT_EMAIL}</span>
            </span>
          </a>
          <Link to="/sss" className="surface flex items-center gap-4 p-4 hover:border-white/15">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]"><FaQuestionCircle /></span>
            <span>
              <span className="block text-xs text-white/45">Sık sorulan sorular</span>
              <span className="font-semibold">Cevabı orada olabilir</span>
            </span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="surface mt-6 space-y-4 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">Adın</label>
              <input id="name" className="input" value={form.name} onChange={update('name')} required autoComplete="name" />
            </div>
            <div>
              <label htmlFor="subject" className="field-label">Konu</label>
              <select id="subject" className="select" value={form.subject} onChange={update('subject')}>
                {SUBJECTS.map(subject => <option key={subject}>{subject}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="message" className="field-label">Mesajın</label>
            <textarea id="message" className="textarea" rows={6} value={form.message} onChange={update('message')} required minLength={10} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/40">Gönder'e bastığında mesajın e-posta uygulamanda hazır olarak açılır.</p>
            <button type="submit" className="btn btn-primary">
              <FaPaperPlane className="text-xs" /> E-posta ile gönder
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Contact;
