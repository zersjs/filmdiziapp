import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { EmptyState } from '../components/UI/States';

const FAQ = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      question: "SINEFIX nedir?",
      answer: "SINEFIX, kullanıcıların çeşitli film ve dizileri ücretsiz olarak izleyebileceği bir online streaming platformudur. Platformumuz, zengin içerik kütüphanesi ve kullanıcı dostu arayüzüyle film ve dizi tutkunlarına kaliteli bir izleme deneyimi sunmayı amaçlamaktadır."
    },
    {
      question: "SINEFIX'i nasıl kullanabilirim?",
      answer: "SINEFIX'i kullanmak çok kolay! Sitemize giriş yaptıktan sonra ana sayfada popüler içerikleri görebilir, kategorilere göz atabilir veya arama çubuğunu kullanarak istediğiniz film veya diziyi bulabilirsiniz. İzlemek istediğiniz içeriğin detay sayfasına giderek 'İzle' butonuna tıklamanız yeterlidir."
    },
    {
      question: "SINEFIX'te hesap oluşturmam gerekiyor mu?",
      answer: "Hayır. Favorileriniz, izleme listeniz ve kaldığınız bölümler hesap olmadan da bu cihazdaki tarayıcınızda saklanır. Sahneler akışında beğenmek, kaydetmek ve yorum yapmak için ücretsiz bir hesap oluşturabilirsiniz."
    },
    {
      question: "İçerikler neden bazen yüklenmiyor?",
      answer: "İçeriklerin yüklenmemesinin birkaç nedeni olabilir. İnternet bağlantınızı kontrol etmenizi, farklı bir tarayıcı denemenizi veya reklam engelleyicinizin ayarlarını kontrol etmenizi öneririz. Ayrıca, içerik sağlayıcılarımız zaman zaman güncelleme yapabilir veya geçici olarak hizmet dışı kalabilir, bu durumda farklı bir kaynak seçeneğini deneyebilirsiniz."
    },
    {
      question: "Neden bazı içerikler HD kalitesinde değil?",
      answer: "İçerik kalitesi, sağlayıcılarımızın sunduğu kaynaklara bağlıdır. Her zaman mümkün olan en yüksek kaliteyi sunmaya çalışıyoruz, ancak bazı eski içerikler veya daha az popüler yapımlar için HD sürümler mevcut olmayabilir. Ayrıca, internet bağlantı hızınız da izleme kalitesini etkileyebilir."
    },
    {
      question: "Platformda neden reklamlar var?",
      answer: "SINEFIX, kullanıcılarına ücretsiz hizmet sunabilmek için reklam desteğine ihtiyaç duymaktadır. Reklamlar, platformumuzun bakım maliyetlerini karşılamamıza ve size kesintisiz hizmet sunmamıza yardımcı olur. Daha iyi bir deneyim için reklam engelleyici kullanmanızı öneririz."
    },
    {
      question: "Mobil cihazlarda SINEFIX'i nasıl kullanabilirim?",
      answer: "SINEFIX'e mobil tarayıcınız üzerinden erişebilirsiniz. Sitemiz, mobil cihazlar için tam uyumludur ve responsive tasarımı sayesinde küçük ekranlarda da sorunsuz çalışır. Şu an için native bir mobil uygulamamız bulunmamaktadır, ancak gelecekte bu konuda geliştirmeler yapmayı planlıyoruz."
    },
    {
      question: "İstediğim film veya dizi platformda yoksa ne yapabilirim?",
      answer: "Aradığınız içeriği bulamazsanız, İletişim sayfamız üzerinden bize bildirebilirsiniz. İsteklerinizi değerlendirir ve mümkün olduğunca kısa sürede eklemeye çalışırız. İçerik önerileriniz, platformumuzu geliştirmemize büyük katkı sağlar."
    },
    {
      question: "Telif hakkı ihlali bildiriminde bulunmak istiyorum, ne yapmalıyım?",
      answer: "Telif hakkı ihlali bildiriminde bulunmak için İletişim sayfamızdaki formu kullanabilir veya doğrudan copyright@sinefix.com adresine e-posta gönderebilirsiniz. Bildiriminizi aldıktan sonra en kısa sürede gerekli işlemleri başlatacağız."
    },
    {
      question: "SINEFIX'te yabancı dil seçeneği var mı?",
      answer: "Şu anda platformumuz Türkçe olarak hizmet vermektedir. İçeriklerimizin çoğunda Türkçe altyazı seçeneği bulunmaktadır. Gelecekte farklı dil seçenekleri eklemeyi planlıyoruz."
    },
    {
      question: "Ödeme bilgilerimi girmeye gerek var mı?",
      answer: "SINEFIX tamamen ücretsizdir ve herhangi bir ödeme bilgisi talep etmemektedir. Platformumuzda asla kredi kartı veya banka bilgileriniz istenmeyecektir. Eğer böyle bir talep görürseniz, bu bir dolandırıcılık girişimi olabilir ve derhal bize bildirmenizi rica ederiz."
    },
    {
      question: "İçerikle ilgili bir hata veya sorun nasıl bildirebilirim?",
      answer: "İçerikle ilgili sorunları İletişim sayfamız üzerinden bildirebilir veya destek@sinefix.com adresine e-posta gönderebilirsiniz. Hata raporlarınızı detaylı bir şekilde belirtmeniz, sorunun daha hızlı çözülmesine yardımcı olacaktır."
    }
  ];

  const term = searchTerm.trim().toLocaleLowerCase('tr-TR');
  const filteredFAQs = faqItems.filter(item =>
    item.question.toLocaleLowerCase('tr-TR').includes(term) ||
    item.answer.toLocaleLowerCase('tr-TR').includes(term)
  );

  return (
    <>
      <Helmet>
        <title>Sıkça Sorulan Sorular - SINEFIX</title>
        <meta name="description" content="SINEFIX hakkında sıkça sorulan sorular ve cevaplar." />
      </Helmet>

      <div className="page container-custom max-w-3xl">
        <h1 className="page-title">Sıkça sorulan sorular</h1>
        <p className="page-subtitle">Platformla ilgili merak ettiklerin.</p>

        <div className="input-with-icon mb-6 mt-6">
          <FaSearch />
          <input
            type="search"
            placeholder="Soru veya cevap ara…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            aria-label="Sorularda ara"
          />
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="space-y-2">
            {filteredFAQs.map((item) => {
              const open = activeQuestion === item.question;
              return (
                <div key={item.question} className="surface overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02]"
                    onClick={() => setActiveQuestion(open ? null : item.question)}
                    aria-expanded={open}
                  >
                    <span className="text-[15px] font-semibold">{item.question}</span>
                    <FaChevronDown className={`flex-shrink-0 text-xs text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-white/65">{item.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sonuç bulunamadı" description="Aramanla eşleşen bir soru yok." />
        )}

        <div className="surface mt-10 p-6 text-center">
          <h2 className="text-lg font-bold">Sorunun cevabını bulamadın mı?</h2>
          <p className="mt-1 text-sm text-white/50">Bize yaz, yardımcı olalım.</p>
          <Link to="/iletisim" className="btn btn-primary mt-4">İletişime geç</Link>
        </div>
      </div>
    </>
  );
};

export default FAQ;
