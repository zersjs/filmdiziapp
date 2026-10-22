# SINEFIX

TMDB verileriyle çalışan, Türkçe arayüzlü film ve dizi keşif uygulaması. Sunucu tarafı yoktur; veriler doğrudan
[TMDB API](https://developer.themoviedb.org/)'den, üyelik ve sosyal özellikler [Supabase](https://supabase.com/)'den gelir.

## Özellikler

- **Ana sayfa:** dönen öne çıkanlar, trendler (bugün / bu hafta), popüler ve en yüksek puanlı film/dizi satırları
- **Filmler / Diziler:** sıralama, tür, yıl ve puan filtreleri; filtreler ve sayfa numarası URL'de tutulur
- **Detay sayfası:** özet, bilgiler, oyuncular, sezon/bölüm listesi, videolar ve görseller, TMDB incelemeleri, fragman
- **İzleme sayfası:** kaynak seçimi (tercih hatırlanır), önceki/sonraki bölüm, sezon değiştirme
- **Kütüphane (hesapsız, tarayıcıda saklanır):** favoriler, izleme listesi, kaldığın bölümden "izlemeye devam et"
- **Arama:** Ctrl+K / `/` ile hızlı arama, film/dizi/kişi filtresiyle tam arama sayfası
- **Sahneler:** dikey kaydırmalı fragman akışı; giriş yapan kullanıcılar beğenip kaydedebilir ve yorum yapabilir
- **Hesap:** e-posta/şifre veya Google ile giriş, şifre sıfırlama (Supabase Auth)

Arayüz telefon, tablet ve masaüstü için ayrı ayrı düzenlenmiştir: masaüstünde sol menü, daha küçük ekranlarda
üst bar + alt menü kullanılır; dokunmatik cihazlarda kart aksiyonları her zaman görünür.

## Teknolojiler

React 18, Vite, React Router 6, TanStack Query (önbellek ve istek yönetimi), Tailwind CSS, Supabase JS, Vitest.

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
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Supabase projesi; tanımlanmazsa üyelik özellikleri kapalı olur |

Supabase tarafında `likes`, `bookmarks`, `watch_history` ve `comments` tabloları kullanılır
(bkz. `src/services/supabase.js`).

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
src/
  components/   Layout (menüler, footer), UI (kart, satır, modal, toast…), Detail, Library, Auth
  contexts/     AppContext (favoriler, izleme listesi, devam et), AuthContext (Supabase)
  hooks/        useTmdb (React Query hook'ları), useShorts, useDebounce, useMediaQuery
  pages/        Rota başına bir sayfa; MediaDetail film ve dizi detayını ortak işler
  services/     tmdb, supabase, browse (filtre mantığı), shorts, player
  utils/        biçimlendirme ve yol yardımcıları
```

Bu ürün TMDB API'sini kullanır ancak TMDB tarafından onaylanmamış veya desteklenmemektedir.
