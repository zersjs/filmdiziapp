import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
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
      answer: "SINEFIX'te içerikleri izlemek için hesap oluşturmanız gerekmiyor. Ancak, favorilerinizi kaydetmek, izleme geçmişinizi takip etmek ve kişiselleştirilmiş öneriler almak için ücretsiz bir hesap oluşturmanızı öneririz."
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

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Sıkça Sorulan Sorular - SINEFIX</title>
        <meta name="description" content="SINEFIX hakkında sıkça sorulan sorular ve cevaplar. Platformumuz ile ilgili merak ettiklerinizi bulun." />
      </Helmet>

      <div className="container-custom py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Sıkça Sorulan Sorular</h1>
        
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Soru veya cevap ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <div key={index} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm">
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-800/50 transition-colors duration-200"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="text-lg font-semibold">{item.question}</span>
                  {activeIndex === index ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ${activeIndex === index ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                  <p className="text-gray-300">{item.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-400">Aramanızla eşleşen herhangi bir soru veya cevap bulunamadı.</p>
            </div>
          )}
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Sorunuza cevap bulamadınız mı?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Sorunuza cevap bulamadıysanız, lütfen bizimle iletişime geçmekten çekinmeyin. Ekibimiz size en kısa sürede yardımcı olacaktır.
          </p>
          <a
            href="/iletisim"
            className="inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Bizimle İletişime Geçin
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 
