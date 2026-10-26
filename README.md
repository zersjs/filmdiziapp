# SINEFIX

TMDB verileriyle çalışan, Türkçe arayüzlü film ve dizi keşif uygulaması. Üyelik yoktur: kullanıcının listeleri
tarayıcıda saklanır, istenirse tek bir Vercel fonksiyonu üzerinden cihazlar arasında eşitlenir.

## Özellikler

- **Üst başlık:** tüm ekranlarda sabit; görselli sayfalarda saydam, kaydırınca dolar. Masaüstünde seçili/üzerinde
  durulan bağlantının arkasında **kayan kutu**, Filmler/Diziler için açılır menü (hızlı listeler, tüm türler,
  Türkiye'deki platformlar), arama kutusu (Ctrl/⌘ K) ve **Kitaplığım** paneli (sayılar, senkron durumu, kaldığın
  yerler). Mobilde aşağı kaydırınca gizlenir, yukarı kaydırınca geri gelir; alt menüde de kayan gösterge var.
- **Ana sayfa:** ilerleme çubuklu öne çıkanlar (çubuk dolunca sonraki slayt; üzerine gelince/odaktayken durur,
  yöne göre kayan geçiş, kaydırma ve ←/→), trendler (bugün / bu hafta), popüler ve en yüksek puanlı satırlar,
  kitaplıktaki dizilerin **yeni ve yaklaşan bölümleri** ("Takip ettiklerinde yeni bölümler")
- **Filmler / Diziler:** kalıcı tür adresleri (`/movies/genre/korku`), sıralama, yıl, puan ve **platform** filtresi
  (Netflix, Prime Video, Disney+… Türkiye kataloğu); filtreler ve sayfa numarası URL'de tutulur
- **Sekmeler ve segmentler:** seçili sekmenin arkasındaki kutu yeni sekmeye kayar; içerik yöne göre sağa/sola
  kayarak değişir (eski panel bir yana çıkar, yenisi diğer yandan gelir). Dokunmatikte sağa/sola kaydırarak,
  klavyede ok tuşlarıyla sekme değiştirilir. Detay görseli ekrandan çıkınca sekme çubuğunda küçük afiş, başlık
  ve "İzle" düğmesi belirir.
- **İzleme takibi:** filmlerde "İzledim", dizilerde bölüm bazında onay işaretleri; sezon ilerleme çubuğu, "Sezonu
  izlendi işaretle", atlanan bölümler için "Önceki N bölümü de işaretle" önerisi, "Sonraki bölüm"e geçince mevcut
  bölümün otomatik işaretlenmesi (geri alınabilir). Detaydaki İzle düğmesi **sıradaki bölümü** gösterir; izlenenler
  `/izlediklerim` sayfasında listelenir ve senkronizasyonla diğer cihazlara gider.
- **Detay sayfası:** özet, **Türkiye'de nerede izlenir** (abonelik / kiralık / satın alma), filmlerde
  "şimdi başlarsan 23.41'de biter", dizilerde bir sonraki bölümün tarihi, serinin diğer filmleri, oyuncular,
  sezon/bölüm listesi, videolar ve görseller, TMDB incelemeleri, fragman
- **Ne izlesem?** (`/ne-izlesem`): ruh hali, süre, dönem ve sahip olunan platformlara göre öneri; kitaplıktakileri
  atlar, "Başka öner" ile sıradaki yapıma geçer, seçimler paylaşılabilir adreste tutulur
- **Yakında çıkacaklar:** kartlarda vizyon/yayın tarihine geri sayım
- **İzleme sayfası:** kaynak seçimi (tercih hatırlanır), önceki/sonraki bölüm, sezon değiştirme
- **Kitaplık:** favoriler, izleme listesi, kaldığın bölümden "izlemeye devam et"
- **Arama:** Ctrl+K / `/` ile hızlı arama, son aramalar (yalnızca bu cihazda), film/dizi/kişi filtresiyle tam arama sayfası
- **Klavye:** `?` kısayol listesi; `g` ardından `h f d s n l` ile sayfalar arası geçiş; detayda `t` fragman, `l` liste,
  `f` favori, `w` izledim (film); sekmelerde ←/→, Home/End
- **Sahneler:** dikey kaydırmalı fragman akışı (ayrıntılar aşağıda)
- **Kitaplık ve senkronizasyon:** hesapsız; isteğe bağlı senkron koduyla cihazlar arası eşitleme, JSON yedek/geri yükleme

Arayüz telefon, tablet ve masaüstü için ayrı ayrı düzenlenmiştir: tüm boyutlarda üst başlık, 1024 px altında ek
olarak alt menü kullanılır; dokunmatik cihazlarda kart aksiyonları her zaman görünür.

Animasyonlar (sayfa geçişi, kartların sırayla belirmesi, ekrana giren satırlar, hero'da yavaş yakınlaşma, kayan
sekme çizgisi, favori/liste "pop" geri bildirimi, öneri kartlarının karıştırılması) işletim sisteminin
**hareketi azalt** tercihinde kapanır.

## Arama motoru optimizasyonu (SEO)

Uygulama tek sayfalıktır; arama motorları ve sosyal ağ önizlemeleri için ilk HTML sunucuda hazırlanır:

- **`api/render.js`** (`server/render.js`): statik dosya olmayan her adres bu fonksiyondan geçer. Derlenmiş
  `dist/index.html` şablonuna sayfaya özel `<title>`, description, canonical, Open Graph/Twitter etiketleri ve
  JSON-LD (Movie, TVSeries, Person, BreadcrumbList, ItemList) yazar; JavaScript çalıştırmayan istemciler için
  başlık, özet, oyuncu ve benzer yapım bağlantılarını içeren düz HTML ekler. JavaScript açık kullanıcılar bu
  içeriği görmez (`.js .ssr-shell { display: none }`), React ilk çizimde yerine geçer.
- **Doğru HTTP durumları:** eksik/eski slug → 301 kalıcı adrese (`/movie/550` → `/movie/550/dovus-kulubu-izle`),
  eski `?genre=` ve `/genre/:tür/:id` adresleri → 301 tür sayfasına, olmayan içerik → 404, kişisel sayfalar
  (izleme, arama, kitaplık) → `noindex`.
- **Tek kaynak:** etiketler ve JSON-LD `src/lib/seo.js`'te üretilir; sunucu ve tarayıcıdaki `<Seo>` bileşeni aynı
  fonksiyonları kullanır. Sunucunun bastığı etiketler `data-rh` ile işaretlidir, React Helmet bunları kopyalamadan devralır.
- **TMDB puanı yapılandırılmış veriye `aggregateRating` olarak yazılmaz** (Google, başka sitelerden toplanan
  puanların işaretlenmesine izin vermez).
- **Site haritası:** `/sitemap.xml` (dizin) → `/sitemaps/{pages,movies,series,people}.xml`; popüler, en iyi ve
  trend listelerinden derlenir, afişler görsel site haritası olarak eklenir. `/robots.txt` site haritasını bildirir.
- **Önbellek:** sayfalar CDN'de 1 saat (`s-maxage`), TMDB'ye ulaşılamazsa varsayılan etiketlerle 1 dakika önbelleğe alınır.
- Ana sayfa statik `index.html` olarak sunulur; etiketleri derleme sırasında yazılır (`vite.config.js`).
  `npm run build && npm run preview` sunucu tarafını yerelde birebir taklit eder.

## Teknolojiler

React 18, Vite, React Router 6, TanStack Query (önbellek ve istek yönetimi), Tailwind CSS, YouTube IFrame API,
Vercel Functions + Upstash Redis (isteğe bağlı senkronizasyon), Vitest.

## Veri saklama ve senkronizasyon

- **Varsayılan:** favoriler, izleme listesi, "izlemeye devam et" ve izlenenler (filmler + dizi bölümleri) yalnızca
  `localStorage`'da tutulur. Sunucu gerekmez.
- **Cihazlar arası eşitleme (isteğe bağlı):** Ayarlar sayfası 125 bitlik rastgele bir *senkron kodu* üretir.
  `api/library.js` bu kodu `Authorization: Bearer` başlığında alır, **SHA-256 özetini** anahtar olarak kullanır
  (kod sunucuda saklanmaz) ve veriyi Upstash Redis'e yazar.
- **Güvenlik:** e-posta/şifre yoktur; gelen veri şemaya göre temizlenir (bilinmeyen alanlar atılır, liste ve
  gövde boyutu sınırlıdır: 256 KB), IP ve kod başına dakikalık hız sınırı vardır, veriler 13 ay kullanılmazsa
  kendiliğinden silinir. Redis anahtarları `VITE_` ön eki taşımadığı için tarayıcı paketine girmez.
- **Çakışmalar:** iki cihazdaki listeler silme kayıtlarıyla (tombstone) birleştirilir; bir cihazda silinen öğe
  diğerinden geri gelmez, en son yapılan değişiklik kazanır (`src/lib/library.js`).

### Vercel'de etkinleştirme

1. Vercel projesinde **Storage → Marketplace → Upstash for Redis** ekleyin (ücretsiz plan yeterli).
   `KV_REST_API_URL` ve `KV_REST_API_TOKEN` değişkenleri otomatik tanımlanır.
2. Yeniden deploy edin. Değişkenler yoksa `/api/library` 503 döner ve uygulama tamamen yerel çalışmaya devam eder.

Geliştirmede (`npm run dev`) aynı handler Vite tarafından çalıştırılır; Upstash tanımlı değilse bellek içi depo kullanılır.

## Sahneler (kısa fragman akışı)

- **Akış motoru** (`src/services/shorts.js`): trend, vizyondaki, yakında, popüler dizi ve en iyi listeleri
  sırayla karıştırır; kitaplığındaki türlere göre kişisel kaynak ekler. Fragmanlar yalnızca gerektiğinde ve
  paralel çözülür (aktif sahnenin önünde 5 hazır sahne tutulur); izlenenler ve oynatılamayan videolar hatırlanır.
- **Oynatıcı** (`src/components/Shorts/ShortPlayer.jsx`): YouTube IFrame API ile gerçek ilerleme çubuğu (ileri sarılabilir),
  bitince otomatik geçiş, gömülemeyen videoyu atlama, tarayıcı sesi engellerse sessize dönme, sekme gizlenince duraklama.
  Yalnızca aktif ve sıradaki sahne için oynatıcı oluşturulur.
- **Arayüz:** tarayıcının kendi scroll-snap kaydırması; dokun = oynat/duraklat, çift dokun = beğen,
  `↑ ↓ j k` gezinme, `Space` duraklat, `M` ses. Mobilde sığdır/doldur seçeneği, masaüstünde video + bilgi paneli.
  Veri tasarrufu veya azaltılmış hareket tercihinde videolar kendiliğinden başlamaz.

## Kurulum

```bash
npm install
cp .env.example .env   # değerleri doldurun
npm run dev            # http://localhost:3000
```

### Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `VITE_TMDB_API_KEY` / `VITE_TMDB_ACCESS_TOKEN` | TMDB anahtarları (tanımlanmazsa koddaki varsayılanlar kullanılır) |
| `VITE_SITE_URL` | Canonical / Open Graph / site haritası için kalıcı adres (Vercel'de boşsa üretim alan adı) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | İsteğe bağlı, yalnızca sunucuda: Upstash Redis (senkronizasyon) |

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (`dist/`) |
| `npm run preview` | Derlemeyi yerelde sunar (sunucu tarafı SEO, site haritası ve robots.txt dahil) |
| `npm test` | Testleri bir kez çalıştırır |
| `npm run test:watch` | Testleri izleme modunda çalıştırır |

## Proje yapısı

```
api/            Vercel Functions: library (senkronizasyon), render (sayfa HTML'i), sitemap, robots
server/         Sunucu tarafı: kitaplık handler'ı ve deposu, render, sitemap, TMDB istemcisi
src/
  components/   Layout (SiteHeader, alt menü), UI (kart, satır, Segmented, SlideTransition, toast…), Detail, Library, Shorts
  contexts/     AppContext (kitaplık + senkronizasyon durumu)
  hooks/        useTmdb (React Query), useShortsFeed, useIndicator (kayan kutu), useSwipe, useSlideDirection, …
  lib/          istemci ve sunucu ortak: library (kitaplık modeli), seo (etiket + JSON-LD), genres (tür adresleri),
                airing (yeni bölüm takibi), episodes (bölüm sırası, ilerleme, sıradaki bölüm), tmdbConfig
  pages/        Rota başına bir sayfa; MediaDetail film ve dizi detayını ortak işler
  services/     tmdb, browse, recommend (Ne izlesem?), shorts (akış motoru), youtube, sync, player
  utils/        biçimlendirme ve yol yardımcıları
```

Bu ürün TMDB API'sini kullanır ancak TMDB tarafından onaylanmamış veya desteklenmemektedir.
