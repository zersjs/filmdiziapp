import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaYoutube, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const footerLinks = [
    {
      title: 'Keşfet',
      links: [
        { label: 'Popüler Filmler', path: '/movies?sort=popular' },
        { label: 'Popüler Diziler', path: '/series?sort=popular' },
        { label: 'En Yüksek Puanlılar', path: '/movies?sort=top_rated' },
        { label: 'Yakında Vizyonda', path: '/movies?sort=upcoming' },
      ]
    },
    {
      title: 'Türler',
      links: [
        
        { label: 'Macera', path: '/genre/movie/12' },
        { label: 'Animasyon', path: '/genre/movie/16' }, 
        { label: 'Suç', path: '/genre/movie/80' },
        { label: 'Belgesel', path: '/genre/movie/99' },
        { label: 'Aile', path: '/genre/movie/10751' },
        { label: 'Fantastik', path: '/genre/movie/14' },
        { label: 'Korku', path: '/genre/movie/27' },
        { label: 'Müzikal', path: '/genre/movie/10402' }
      ].sort(() => {
        
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        return (Math.sin(seed) * 10000) % 2 - 1;
      }).slice(0, 4) 
    },
    {
      title: 'Hakkımızda',
      links: [
        { label: 'İletişim', path: '/iletisim' },
        { label: 'Gizlilik Politikası', path: '/gizlilik-politikasi' },
        { label: 'Kullanım Koşulları', path: '/kullanim-kosullari' },
        { label: 'SSS', path: '/sss' },
      ]
    }
  ];

  const socialLinks = [
    { icon: <FaGithub size={20} />, url: '#', label: 'GitHub' },
    { icon: <FaTwitter size={20} />, url: '#', label: 'Twitter' },
    { icon: <FaInstagram size={20} />, url: '#', label: 'Instagram' },
    { icon: <FaYoutube size={20} />, url: '#', label: 'YouTube' },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <footer className="bg-gray-950 border-t border-gray-900 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold">SINE<span className="text-gray-500">FIX</span></h2>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Binlerce film ve diziyi ücretsiz izleyin. En yeni içerikler, en kaliteli izleme deneyimi.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((section, index) => (
            <div key={index} className="col-span-1">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-900 mt-8 pt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 text-center">İzleme Hakkında Bilgilendirme</h3>
            <div className="text-gray-400 text-sm leading-relaxed">
              <p className="mb-3">
                SINEFIX, film ve dizi izleme deneyiminizi kolaylaştırmak için tasarlanmış bir platformdur. Sitemizde bulunan içerikler çeşitli internet kaynaklarından derlenmektedir ve bu içeriklerin telif hakları ilgili yapımcılara aittir.
              </p>
              <p className="mb-3">
                Sunduğumuz hizmet, yasal olarak izleyebileceğiniz içeriklere kolay erişim sağlamak amacıyla geliştirilmiştir. İçerikler üçüncü taraf video sağlayıcıları üzerinden sunulmaktadır ve SINEFIX bu içeriklerin barındırılmasından sorumlu değildir.
              </p>
              <p className="mb-3">
                Telif hakkı sahipleri, içeriklerinin kaldırılmasını talep edebilirler. Bu tür talepler için lütfen iletişim sayfamızı kullanın. SINEFIX olarak, telif haklarına saygı duyuyor ve yasal düzenlemelere uygun hareket ediyoruz.
              </p>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <span className="mr-2">🛡️</span>
                    Reklam Engelleyici Önerisi
                  </h4>
                  <div className="text-xs space-y-1">
                    <p><strong>PC:</strong> uBlock Origin (Chrome/Firefox/Edge)</p>
                    <p><strong>Mobil:</strong> Brave Browser uygulaması</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <span className="mr-2">📱</span>
                    Sorun Yaşıyorsanız
                  </h4>
                  <div className="text-xs space-y-1">
                    <p>• Farklı video kaynağı deneyin</p>
                    <p>• Tarayıcınızı güncelleyin</p>
                    <p>• Reklam engelleyici kurun</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-900 pt-6">
          <button 
            onClick={toggleCollapse}
            className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-5 py-3 mb-4"
          >
            <span className="text-white font-medium">Film ve Dizi İzleme Deneyimi</span>
            {isCollapsed ? <FaChevronDown className="text-gray-400" /> : <FaChevronUp className="text-gray-400" />}
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
            <div className="bg-gray-900 rounded-lg p-6 text-gray-300 text-sm leading-relaxed space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">✨ Film ve Dizi Keyfi</h4>
                <p>
                  Film ve dizi izlemek, günün stresinden uzaklaşıp keyifli bir akşam geçirmenin en güzel yollarından biri! Sürükleyici hikayeler, etkileyici oyunculuklar ve dünyanın dört bir yanından gelen yapımlarla ekran başında unutulmaz anlar yaşayabilirsiniz. En popüler yapımlardan kült filmlere kadar geniş bir seçki sunan platformumuzda, aradığınız içeriğe kolayca ulaşabilirsiniz.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-2">🎬 Tüm Tarzlar, Tüm Zevkler</h4>
                <p>
                  Sevdiğiniz tür ne olursa olsun, aksiyondan komediye, dramdan bilim kurguya kadar binlerce film ve diziyi keşfetme fırsatı sizi bekliyor. Üstelik yüksek görüntü kalitesi ve kullanıcı dostu arayüzümüzle izleme keyfinizi en üst seviyeye taşıyoruz.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-2">🚀 Kesintisiz İzleme</h4>
                <p>
                  Zamansız favorilerden son çıkan hitlere kadar en güncel içeriklere buradan ulaşabilirsiniz. Reklamsız, hızlı ve kesintisiz bir izleme deneyimiyle, film ve dizi dünyasına adım atın. İzleme arayışınıza son verin, favori yapımlarınız tek bir tık uzağınızda!
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🏆</span> En çok izlenen filmler ve diziler
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📺</span> Yeni sezonlarıyla gündemde olan yapımlar
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎭</span> Türlere göre filtreleme ve kişisel öneriler
                </p>
              </div>
              
              <p className="text-yellow-300 font-medium">
                Sen de film ve dizi keyfini doyasıya yaşamak için hemen keşfetmeye başla! ☀️
              </p>
              
              <p className="text-gray-400 text-xs mt-4 text-center">
                Sevgi ❤️ ile inşa edildi.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-6 text-center mt-6">
          <p className="text-gray-500 text-sm">
            © {currentYear} SINEFIX. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Bu site TMDB API kullanmaktadır. İçerikler TMDB'den alınmaktadır.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Video kaynakları 3. parti servislerden sağlanmaktadır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
