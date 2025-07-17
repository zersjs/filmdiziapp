import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Gizlilik Politikası - SINEFIX</title>
        <meta name="description" content="SINEFIX gizlilik politikası. Kişisel verilerinizin nasıl işlendiği hakkında bilgi edinin." />
      </Helmet>

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Gizlilik Politikası</h1>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-10 backdrop-blur-sm shadow-xl mb-12 prose prose-invert max-w-none">
            <p className="text-gray-400">Son güncelleme tarihi: 1 Haziran 2023</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Genel Bakış</h2>
            <p>
              SINEFIX olarak kişisel gizliliğinize saygı duyuyor ve sitemizi kullandığınızda bilgilerinizin 
              korunmasını sağlamak için çaba gösteriyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullanırken 
              sizinle ilgili hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve nasıl koruduğumuzu açıklar.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Topladığımız Bilgiler</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Hesap Bilgileri</h3>
            <p>
              SINEFIX'te bir hesap oluşturduğunuzda, adınız, e-posta adresiniz ve şifreniz gibi kişisel bilgilerinizi 
              kaydederiz. Bu bilgiler hesabınızın oluşturulması ve yönetilmesi için gereklidir.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Kullanım Verileri</h3>
            <p>
              Platformumuzu nasıl kullandığınıza ilişkin bilgileri otomatik olarak toplarız. Bu bilgiler arasında 
              izlediğiniz içerikler, arama geçmişiniz, platformda geçirdiğiniz süre ve etkileşimde bulunduğunuz 
              özellikler yer alabilir.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Teknik Veriler</h3>
            <p>
              IP adresi, cihaz kimliği, tarayıcı türü ve versiyonu, işletim sistemi ve diğer teknik bilgiler gibi 
              verileri de toplayabiliriz.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Verilerin Kullanımı</h2>
            <p>
              Topladığımız verileri aşağıdaki amaçlarla kullanırız:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Hesabınızı yönetmek ve hizmetlerimizi sunmak</li>
              <li>İçerik önerilerini kişiselleştirmek</li>
              <li>Platformumuzu ve hizmetlerimizi iyileştirmek</li>
              <li>Kullanıcı deneyimini analiz etmek ve geliştirmek</li>
              <li>İstenmeyen veya yasadışı faaliyetleri tespit etmek ve önlemek</li>
              <li>Size özel teklifler ve promosyonlar sunmak (izin vermeniz halinde)</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Veri Paylaşımı</h2>
            <p>
              Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Açık onayınız olduğunda</li>
              <li>Hizmetlerimizi sunmak için gerekli olduğunda (örn. ödeme işlemcileri)</li>
              <li>Yasal bir yükümlülüğe uymak gerektiğinde</li>
              <li>Haklarımızı, mülkiyetimizi veya güvenliğimizi korumak için gerektiğinde</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Çerezler ve Takip Teknolojileri</h2>
            <p>
              Platformumuzda çerezler ve benzer takip teknolojileri kullanıyoruz. Bu teknolojiler, kullanıcı deneyimini 
              iyileştirmek, site kullanımını analiz etmek ve kişiselleştirilmiş içerik sunmak için kullanılır. Çerez 
              ayarlarınızı tarayıcı ayarlarınızdan değiştirebilirsiniz.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Veri Güvenliği</h2>
            <p>
              Verilerinizin güvenliğini sağlamak için makul teknik ve organizasyonel önlemler alıyoruz. Ancak, 
              internet üzerinden hiçbir veri aktarımının veya elektronik depolamanın %100 güvenli olmadığını unutmayın.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Kullanıcı Hakları</h2>
            <p>
              Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Verilerinize erişim talep etme</li>
              <li>Verilerinizin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Veri işlememize itiraz etme</li>
              <li>Veri taşınabilirliği talep etme</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Politika Değişiklikleri</h2>
            <p>
              Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Herhangi bir değişiklik olması durumunda, 
              güncel versiyonu sitemizde yayınlayacağız ve önemli değişiklikler için sizi bilgilendireceğiz.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">9. İletişim</h2>
            <p>
              Gizlilik Politikamız veya verilerinizin işlenmesiyle ilgili herhangi bir sorunuz varsa, 
              lütfen <a href="mailto:privacy@sinefix.com" className="text-red-400 hover:text-red-300">privacy@sinefix.com</a> adresinden bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 