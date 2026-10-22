import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <div className="page container-custom max-w-3xl">
      <Helmet>
        <title>Gizlilik Politikası - SINEFIX</title>
        <meta name="description" content="SINEFIX gizlilik politikası. Kişisel verilerinizin nasıl işlendiği hakkında bilgi edinin." />
      </Helmet>

      <div>
        <div>
          <h1 className="page-title mb-6">Gizlilik Politikası</h1>
          
          <div className="surface prose-sf p-5 sm:p-8">
            <p className="text-sm text-white/40">Son güncelleme tarihi: 22 Ekim 2026</p>
            
            <h2>1. Genel Bakış</h2>
            <p>
              SINEFIX olarak kişisel gizliliğinize saygı duyuyor ve sitemizi kullandığınızda bilgilerinizin 
              korunmasını sağlamak için çaba gösteriyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullanırken 
              sizinle ilgili hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve nasıl koruduğumuzu açıklar.
            </p>
            
            <h2>2. Topladığımız Bilgiler</h2>

            <h3>2.1 Hesap bilgisi tutmuyoruz</h3>
            <p>
              SINEFIX'te üyelik yoktur. Ad, e-posta adresi veya şifre istemiyor ve saklamıyoruz.
            </p>

            <h3>2.2 Cihazınızda saklanan veriler</h3>
            <p>
              Favorileriniz, izleme listeniz ve izlemeye devam ettiğiniz içerikler yalnızca tarayıcınızın yerel
              depolamasında (localStorage) tutulur. Bu verileri Ayarlar sayfasından dışa aktarabilir veya silebilirsiniz.
            </p>

            <h3>2.3 İsteğe bağlı senkronizasyon</h3>
            <p>
              Cihazlar arası senkronizasyonu açarsanız, film/dizi listeleriniz sunucumuzda rastgele üretilen bir
              senkron koduna bağlı olarak saklanır. Kodun kendisi saklanmaz; yalnızca tek yönlü özeti (SHA-256) anahtar
              olarak kullanılır. 13 ay boyunca kullanılmayan veriler otomatik silinir; Ayarlar sayfasından istediğiniz an
              silebilirsiniz.
            </p>

            <h3>2.4 Teknik veriler</h3>
            <p>
              Kötüye kullanımı önlemek için senkronizasyon isteklerinde IP adresinizin özeti en fazla bir dakika süreyle
              hız sınırlaması amacıyla tutulur. Analiz veya reklam takibi yapmıyoruz.
            </p>

            <h2>3. Verilerin Kullanımı</h2>
            <p>
              Cihazınızdaki ve (açtıysanız) senkronizasyon sunucusundaki veriler yalnızca listelerinizi size göstermek ve
              Sahneler akışını ilgi alanlarınıza göre sıralamak için kullanılır.
            </p>

            <h2>4. Üçüncü Taraf Hizmetler</h2>
            <ul>
              <li>Film ve dizi bilgileri ile görseller TMDB'den yüklenir.</li>
              <li>Fragmanlar YouTube'un gizlilik odaklı (youtube-nocookie.com) oynatıcısıyla gösterilir.</li>
              <li>İzleme sayfasındaki oynatıcılar üçüncü taraf sitelerden yüklenir ve kendi çerezlerini kullanabilir.</li>
            </ul>

            <h2>5. Çerezler</h2>
            <p>
              SINEFIX'in kendisi çerez kullanmaz. Yukarıdaki üçüncü taraf hizmetler kendi politikalarına göre çerez
              kullanabilir; bunları tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>

            <h2>6. Veri Güvenliği</h2>
            <p>
              Verilerinizin güvenliğini sağlamak için makul teknik ve organizasyonel önlemler alıyoruz. Ancak, 
              internet üzerinden hiçbir veri aktarımının veya elektronik depolamanın %100 güvenli olmadığını unutmayın.
            </p>
            
            <h2>7. Kullanıcı Hakları</h2>
            <p>
              Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul>
              <li>Verilerinize erişim talep etme</li>
              <li>Verilerinizin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Veri işlememize itiraz etme</li>
              <li>Veri taşınabilirliği talep etme</li>
            </ul>
            
            <h2>8. Politika Değişiklikleri</h2>
            <p>
              Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Herhangi bir değişiklik olması durumunda, 
              güncel versiyonu sitemizde yayınlayacağız ve önemli değişiklikler için sizi bilgilendireceğiz.
            </p>
            
            <h2>9. İletişim</h2>
            <p>
              Gizlilik Politikamız veya verilerinizin işlenmesiyle ilgili herhangi bir sorunuz varsa, 
              lütfen <a href="mailto:privacy@sinefix.com">privacy@sinefix.com</a> adresinden bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 
