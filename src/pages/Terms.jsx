import React from 'react';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Kullanım Koşulları - SINEFIX</title>
        <meta name="description" content="SINEFIX kullanım koşulları ve şartları. Platformu kullanmadan önce lütfen okuyun." />
      </Helmet>

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Kullanım Koşulları</h1>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-10 backdrop-blur-sm shadow-xl mb-12 prose prose-invert max-w-none">
            <p className="text-gray-400">Son güncelleme tarihi: 1 Haziran 2023</p>
            
            <div className="mb-8">
              <p className="my-4">
                Bu Kullanım Koşulları ("Koşullar"), SINEFIX platformunu kullanımınızı yönetir. Platformumuza erişerek veya 
                hizmetlerimizi kullanarak, bu koşulları kabul etmiş sayılırsınız. Lütfen dikkatle okuyun.
              </p>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Tanımlar</h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>"SINEFIX"</strong>, <strong>"biz"</strong>, <strong>"bize"</strong> veya <strong>"bizim"</strong> ifadeleri SINEFIX platformunu ve hizmetlerini ifade eder.</li>
              <li><strong>"Kullanıcı"</strong>, <strong>"siz"</strong> veya <strong>"sizin"</strong> ifadeleri, SINEFIX platformunu veya hizmetlerini kullanan kişiyi ifade eder.</li>
              <li><strong>"İçerik"</strong>, platformumuzda sunulan film, dizi ve diğer video içeriklerini ifade eder.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Hesap Oluşturma ve Güvenlik</h2>
            <p>
              Platformumuzun bazı özelliklerini kullanabilmek için bir hesap oluşturmanız gerekebilir. Hesabınızı oluştururken 
              doğru, güncel ve eksiksiz bilgiler vermeyi kabul etmiş olursunuz. Aşağıdaki hususları kabul edersiniz:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Hesabınızın güvenliğinden ve şifrenizin gizliliğinden siz sorumlusunuz.</li>
              <li>Hesabınızla gerçekleştirilen tüm aktivitelerden siz sorumlusunuz.</li>
              <li>Hesabınızla ilgili herhangi bir güvenlik ihlalini veya yetkisiz kullanımı derhal bize bildirmelisiniz.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Hizmet Kullanımı</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 İzin Verilen Kullanım</h3>
            <p>
              SINEFIX, size platformumuzda sunulan içeriklere kişisel ve ticari olmayan amaçlarla erişme ve izleme hakkı tanır. 
              Bu lisans devredilemez ve münhasır değildir.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Yasaklanan Kullanımlar</h3>
            <p>
              Aşağıdaki eylemleri gerçekleştirmemeniz gerekmektedir:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>İçerikleri kopyalamak, indirmek, çoğaltmak, dağıtmak veya iletmek.</li>
              <li>İçeriklerimize veya platformumuza erişim kontrollerini atlatmaya çalışmak.</li>
              <li>Platformumuza veya sunucularımıza zarar verebilecek virüsler veya zararlı kodlar yüklemek.</li>
              <li>Platformumuzu yasadışı, hileli veya yetkisiz amaçlarla kullanmak.</li>
              <li>Platformumuzun normal işleyişine müdahale etmek veya aşırı yük bindirmek.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. İçerik ve Telif Hakları</h2>
            <p>
              SINEFIX'te sunulan içerikler, ilgili telif hakkı sahiplerine aittir. İçerikleri görüntülemek için size sınırlı bir lisans veriliyor, 
              ancak içeriklerin mülkiyeti veya fikri mülkiyet hakları size devredilmiyor.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 İçerik Uyarısı</h3>
            <p>
              Platformumuzda sunulan bazı içerikler belirli yaş grupları için uygun olmayabilir. Platformumuzda yer alan içeriklerin 
              yaş sınıflandırmaları ve uyarıları dikkate alınmalıdır.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Üçüncü Taraf Kaynaklar</h2>
            <p>
              SINEFIX, bazı durumlarda üçüncü taraf video kaynaklarına yönlendirmeler içerebilir. Bu üçüncü taraf kaynaklarının 
              içeriklerinden veya gizlilik politikalarından sorumlu değiliz. Bu kaynakları kullanmanız kendi sorumluluğunuzdadır.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Hizmet Değişiklikleri ve Sonlandırma</h2>
            <p>
              SINEFIX, kendi takdirine bağlı olarak, herhangi bir zamanda ve herhangi bir sebeple, size bildirimde bulunarak 
              veya bulunmaksızın hizmetlerini değiştirebilir, askıya alabilir veya sonlandırabilir. Ayrıca, 
              bu Koşulları ihlal etmeniz durumunda, hesabınızı sonlandırma veya askıya alma hakkımızı saklı tutarız.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Sorumluluk Reddi</h2>
            <p>
              SINEFIX hizmetleri "olduğu gibi" ve "mevcut olduğu gibi" sunulmaktadır. Platformumuzun kesintisiz veya hatasız çalışacağını 
              garanti etmiyoruz. Yasaların izin verdiği ölçüde, tüm açık veya zımni garantileri reddediyoruz.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Sorumluluğun Sınırlandırılması</h2>
            <p>
              Yasaların izin verdiği azami ölçüde, SINEFIX, yöneticileri, çalışanları, ortakları veya temsilcileri, platform kullanımınızdan 
              kaynaklanan herhangi bir dolaylı, tesadüfi, özel, sonuç olarak ortaya çıkan veya cezai zararlardan sorumlu olmayacaktır.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Koşulların Değiştirilmesi</h2>
            <p>
              Bu Koşulları herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler, platformumuzda 
              yayınlandıktan sonra geçerli olacaktır. Değişikliklerden sonra platformumuzu kullanmaya devam etmeniz, 
              yeni Koşulları kabul ettiğiniz anlamına gelir.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">10. Uygulanacak Hukuk</h2>
            <p>
              Bu Koşullar Türk hukukuna tabi olacak ve buna göre yorumlanacaktır. Bu Koşullardan kaynaklanan herhangi bir 
              anlaşmazlık, münhasıran İstanbul mahkemeleri ve icra daireleri tarafından çözümlenecektir.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">11. İletişim</h2>
            <p>
              Bu Koşullarla ilgili herhangi bir sorunuz varsa, lütfen <a href="mailto:terms@sinefix.com" className="text-red-400 hover:text-red-300">terms@sinefix.com</a> adresinden bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms; 