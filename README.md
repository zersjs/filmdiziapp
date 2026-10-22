# SINEFIX

TMDB verileriyle çalışan, Türkçe arayüzlü film ve dizi keşif uygulaması. Üyelik yoktur: kullanıcının listeleri
tarayıcıda saklanır, istenirse tek bir Vercel fonksiyonu üzerinden cihazlar arasında eşitlenir.

## Özellikler

- **Ana sayfa:** dönen öne çıkanlar, trendler (bugün / bu hafta), popüler ve en yüksek puanlı film/dizi satırları
- **Filmler / Diziler:** sıralama, tür, yıl ve puan filtreleri; filtreler ve sayfa numarası URL'de tutulur
- **Detay sayfası:** özet, bilgiler, oyuncular, sezon/bölüm listesi, videolar ve görseller, TMDB incelemeleri, fragman
- **İzleme sayfası:** kaynak seçimi (tercih hatırlanır), önceki/sonraki bölüm, sezon değiştirme
- **Kitaplık:** favoriler, izleme listesi, kaldığın bölümden "izlemeye devam et"
- **Arama:** Ctrl+K / `/` ile hızlı arama, film/dizi/kişi filtresiyle tam arama sayfası
- **Sahneler:** dikey kaydırmalı fragman akışı (ayrıntılar aşağıda)
- **Kitaplık ve senkronizasyon:** hesapsız; isteğe bağlı senkron koduyla cihazlar arası eşitleme, JSON yedek/geri yükleme

Arayüz telefon, tablet ve masaüstü için ayrı ayrı düzenlenmiştir: masaüstünde sol menü, daha küçük ekranlarda
üst bar + alt menü kullanılır; dokunmatik cihazlarda kart aksiyonları her zaman görünür.

## Teknolojiler

React 18, Vite, React Router 6, TanStack Query (önbellek ve istek yönetimi), Tailwind CSS, YouTube IFrame API,
Vercel Functions + Upstash Redis (isteğe bağlı senkronizasyon), Vitest.

## Veri saklama ve senkronizasyon

- **Varsayılan:** favoriler, izleme listesi ve "izlemeye devam et" yalnızca `localStorage`'da tutulur. Sunucu gerekmez.
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
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | İsteğe bağlı, yalnızca sunucuda: Upstash Redis (senkronizasyon) |

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (`dist/`) |
| `npm run preview` | Derlemeyi yerelde sunar |
| `npm test` | Testleri bir kez çalıştırır |
| `npm run test:watch` | Testleri izleme modunda çalıştırır |

## Proje yapısı

```
api/            Vercel Functions (library.js: senkronizasyon uç noktası)
server/         Sunucu tarafı handler ve depo (Upstash REST / bellek içi)
src/
  components/   Layout, UI (kart, satır, modal, toast…), Detail, Library, Shorts
  contexts/     AppContext (kitaplık + senkronizasyon durumu)
  hooks/        useTmdb (React Query), useShortsFeed, useDebounce, useMediaQuery
  lib/          library.js: kitaplık veri modeli (doğrulama + birleştirme), istemci ve sunucu ortak
  pages/        Rota başına bir sayfa; MediaDetail film ve dizi detayını ortak işler
  services/     tmdb, browse, shorts (akış motoru), youtube, sync, player
  utils/        biçimlendirme ve yol yardımcıları
```

Bu ürün TMDB API'sini kullanır ancak TMDB tarafından onaylanmamış veya desteklenmemektedir.
