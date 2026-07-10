import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitResult({
        success: true,
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>İletişim - SINEFIX</title>
        <meta name="description" content="SINEFIX ile iletişime geçin. Öneri, şikayet ve işbirlikleri için bize ulaşın." />
      </Helmet>

      <div className="container-custom py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Bizimle İletişime Geçin</h1>

        <div className="max-w-4xl mx-auto bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 md:p-10 shadow-xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="flex flex-col items-center text-center p-6 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all">
              <div className="w-14 h-14 bg-white/[0.06] text-white rounded-full flex items-center justify-center mb-4">
                <FaEnvelope size={22} />
              </div>
              <h3 className="text-lg font-semibold mb-2">E-posta</h3>
              <p className="text-gray-400">info@sinefix.com</p>
              <p className="text-gray-400">destek@sinefix.com</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all">
              <div className="w-14 h-14 bg-white/[0.06] text-white rounded-full flex items-center justify-center mb-4">
                <FaPhone size={22} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Telefon</h3>
              <p className="text-gray-400">+90 (212) 123 45 67</p>
              <p className="text-gray-400">Hafta içi 09:00 - 18:00</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all">
              <div className="w-14 h-14 bg-white/[0.06] text-white rounded-full flex items-center justify-center mb-4">
                <FaMapMarkerAlt size={22} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Adres</h3>
              <p className="text-gray-400">Teknoloji Caddesi, No:34</p>
              <p className="text-gray-400">Levent / İstanbul</p>
            </div>
          </div>

          {submitResult ? (
            <div className={`p-4 rounded-lg mb-8 text-center ${submitResult.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
              {submitResult.message}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Adınız</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">E-posta Adresiniz</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">Konu</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Mesajınız</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Gönderiliyor...</span>
                  </div>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Mesaj Gönder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl border border-[#1a1a1a]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.4346721182933!2d28.99555631541223!3d41.07608097929427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab63f6f4a881b%3A0x3ca66c30586a7496!2sLevent%2C%20Istanbul!5e0!3m2!1sen!2str!4v1632309567297!5m2!1sen!2str" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
            title="SINEFIX Office Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact; 
