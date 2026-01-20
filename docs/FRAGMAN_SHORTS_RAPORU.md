# 🎬 Film/Dizi Fragman Shorts Feed - Fizibilite Raporu

**Tarih:** 20 Ocak 2026  
**Proje:** SineFix - Film/Dizi Platformu  
**Hazırlayan:** AI Assistant

---

## 📌 Özet

Instagram Reels / TikTok benzeri dikey kaydırmalı bir fragman feed'i oluşturmak **tamamen mümkündür**. Mevcut proje altyapısı (React, TMDB API, react-player, framer-motion) bu özelliği desteklemek için yeterlidir.

---

## ✅ TEKNİK FİZİBİLİTE

### 1. TMDB API Fragman Desteği

**Mevcut Durum:** Projede zaten fragman servisleri mevcut (`src/services/trailer.js`, `src/services/tmdb.js`)

**API Endpoint'leri:**

```
GET /movie/{movie_id}/videos
GET /tv/{tv_id}/videos
GET /discover/movie?vote_average.gte=7&sort_by=vote_average.desc
GET /movie/top_rated
GET /tv/top_rated
```

**Dönen Video Verisi:**

```json
{
  "results": [
    {
      "key": "dQw4w9WgXcQ", // YouTube video ID
      "site": "YouTube", // Video platformu
      "type": "Trailer", // Trailer, Teaser, Clip, Behind the Scenes
      "name": "Official Trailer",
      "iso_639_1": "tr", // Dil kodu
      "official": true,
      "published_at": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

**✅ SONUÇ:** TMDB API, YouTube fragman key'lerini sağlıyor. Mevcut `trailerService` bu işlevselliği zaten destekliyor.

---

### 2. YouTube Embed Desteği

**Shorts/Vertical Format Embed:**

```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_KEY?autoplay=1&mute=1&loop=1&playlist=VIDEO_KEY&controls=0&playsinline=1"
  allow="autoplay; encrypted-media"
  allowfullscreen
/>
```

**Önemli Parametreler:**
| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| `autoplay` | 1 | Otomatik oynatma |
| `mute` | 1 | Sessiz başlat (autoplay için zorunlu) |
| `loop` | 1 | Döngüde oynat |
| `playsinline` | 1 | Mobilde tam ekran yerine inline oynat |
| `controls` | 0 | Kontrolleri gizle |
| `start` | 30 | Videonun belirli saniyesinden başlat |
| `end` | 60 | Videonun belirli saniyesinde bitir |

**✅ SONUÇ:** YouTube embed API, shorts benzeri deneyim için tüm parametreleri destekliyor.

---

### 3. Mevcut Teknoloji Stack'i

| Paket                         | Kullanım               | Hazır?    |
| ----------------------------- | ---------------------- | --------- |
| `react-player`                | YouTube video oynatma  | ✅ Mevcut |
| `framer-motion`               | Kaydırma animasyonları | ✅ Mevcut |
| `react-intersection-observer` | Görünürlük tespiti     | ✅ Mevcut |
| `swiper`                      | Swipe/Kaydırma         | ✅ Mevcut |
| `zustand`                     | State management       | ✅ Mevcut |

**✅ SONUÇ:** Tüm gerekli paketler zaten yüklü!

---

## 🎯 ÖNERİLEN MİMARİ

### Yeni Dosyalar

```
src/
├── pages/
│   └── Shorts.jsx              # Ana shorts sayfası
├── components/
│   └── Shorts/
│       ├── ShortsFeed.jsx      # Dikey kaydırma feed'i
│       ├── ShortsCard.jsx      # Tek fragman kartı
│       ├── ShortsPlayer.jsx    # YouTube player wrapper
│       ├── ShortsOverlay.jsx   # Film bilgileri overlay
│       └── ShortsControls.jsx  # Ses, paylaş, beğen butonları
├── services/
│   └── shorts.js               # Shorts için özel API servisi
└── hooks/
    └── useShorts.js            # Shorts state management
```

### Veri Akışı

```
┌─────────────────────────────────────────────────────────┐
│                    SHORTS FEED                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Component Mount                                     │
│     ↓                                                   │
│  2. Fetch top_rated + trending (vote_average >= 7)     │
│     ↓                                                   │
│  3. Her içerik için /videos endpoint'i çağır           │
│     ↓                                                   │
│  4. YouTube fragmanları filtrele (type: Trailer)       │
│     ↓                                                   │
│  5. Rastgele sırala (shuffle)                          │
│     ↓                                                   │
│  6. Infinite scroll ile lazy load                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX TASARIM ÖNERİSİ

### Ekran Düzeni (Dikey Tam Ekran)

```
┌────────────────────────────────────────┐
│  ← Geri       SHORTS          🔍       │ ← Header (opsiyonel)
├────────────────────────────────────────┤
│                                        │
│                                        │
│           ┌──────────────┐             │
│           │              │             │
│           │   YOUTUBE    │             │
│           │   FRAGMAN    │             │
│           │    VIDEO     │             │
│           │              │             │
│           │   (16:9 or   │             │
│           │    9:16)     │             │
│           │              │             │
│           └──────────────┘             │
│                                        │
│  ┌─────────────────────────────────┐   │
│  │ 🎬 Film Adı                     │   │
│  │ ⭐ 8.5 | 2024 | Aksiyon        │   │
│  │ Kısa açıklama...               │   │
│  └─────────────────────────────────┘   │
│                                        │
│         [▶ İzle]  [+ Listeme Ekle]     │
│                                        │
├────────────────────────────────────────┤
│  🔊    ❤️ 2.5K    💬    📤 Paylaş    │ ← Aksiyonlar
└────────────────────────────────────────┘
         ↑ YUKARI/AŞAĞI KAYDIR ↓
```

### Kaydırma Mekaniği

1. **Swiper.js** veya **CSS Scroll Snap** kullanarak dikey kaydırma
2. Her kart tam ekran yüksekliğinde (`100vh` veya `100dvh`)
3. Intersection Observer ile görünür video otomatik oynar
4. Yukarı/aşağı swipe ile sonraki/önceki fragmana geç

---

## 💡 EN İLGİ ÇEKİCİ KISIMDAN OYNATMA

### Strateji 1: Sabit Başlangıç Noktası

```javascript
// Fragmanın genellikle en heyecanlı kısmı ortasındadır
const startTime = Math.floor(trailerDuration * 0.3); // %30'dan başla
const endTime = Math.floor(trailerDuration * 0.6); // %60'a kadar

const youtubeUrl = `https://www.youtube.com/embed/${key}?start=${startTime}&end=${endTime}`;
```

### Strateji 2: YouTube Chapters API (İleri Seviye)

- YouTube API ile video chapter'larını al
- "Best scenes" veya "Action" chapter'ından başlat

### Strateji 3: Dinamik Analiz (Gelecek)

- Video popülerlik verisi kullan
- Kullanıcı etkileşim verisi topla

**✅ ÖNERİ:** Strateji 1 ile başla, basit ve etkili.

---

## 📊 PERFORMANS OPTİMİZASYONLARI

### 1. Lazy Loading

```javascript
// Sadece görünür 3 videoyu yükle (önceki, aktif, sonraki)
const visibleRange = [currentIndex - 1, currentIndex, currentIndex + 1];
```

### 2. Video Preloading

```javascript
// Sonraki videonun thumbnail'ını önceden yükle
<link rel="preload" href={nextThumbnail} as="image" />
```

### 3. Intersection Observer

```javascript
// Video görünür olduğunda otomatik oynat
const { ref, inView } = useInView({ threshold: 0.7 });
useEffect(() => {
  if (inView) player.play();
  else player.pause();
}, [inView]);
```

### 4. Memory Management

```javascript
// Görünmeyen videoları DOM'dan kaldır
{
  shorts.slice(startIndex, endIndex).map((short) => <ShortsCard />);
}
```

---

## ⚠️ SINIRLAMALAR VE ÇÖZÜMLER

### 1. YouTube Autoplay Kısıtlaması

| Problem                                 | Çözüm                              |
| --------------------------------------- | ---------------------------------- |
| Mobilde autoplay için ses kapalı olmalı | Sessiz başlat, kullanıcı ses açsın |
| Bazı tarayıcılar engeller               | Fallback: thumbnail + play butonu  |

### 2. Tüm Filmler/Dizilerde Fragman Yok

| Problem                        | Çözüm                                       |
| ------------------------------ | ------------------------------------------- |
| Bazı içeriklerin fragmanı yok  | Filtreleme: Sadece fragmanı olanları göster |
| Fragman YouTube'da olmayabilir | `site === "YouTube"` kontrolü               |

### 3. Rate Limiting

| Problem              | Çözüm                        |
| -------------------- | ---------------------------- |
| Çok fazla API isteği | Batch fetching, önbellekleme |
| TMDB günlük limit    | Local storage cache          |

---

## 📋 UYGULAMA PLANI

### Faz 1: MVP (1-2 gün)

- [ ] `Shorts.jsx` sayfası oluştur
- [ ] Basit dikey kaydırma implementasyonu
- [ ] YouTube embed player entegrasyonu
- [ ] Top rated içerik fetch'i

### Faz 2: Geliştirme (2-3 gün)

- [ ] Swiper.js ile smooth kaydırma
- [ ] Intersection Observer ile auto-play/pause
- [ ] Film bilgileri overlay
- [ ] Ses kontrolü

### Faz 3: Optimizasyon (1-2 gün)

- [ ] Virtual scrolling (performans)
- [ ] Infinite scroll / pagination
- [ ] Caching stratejisi
- [ ] Loading skeletons

### Faz 4: Bonus Özellikler (opsiyonel)

- [ ] Beğen/Kaydet butonları
- [ ] Paylaşım özellikleri
- [ ] Filtre (tür, yıl, puan)
- [ ] "İzle" butonu ile Watch sayfasına yönlendirme

---

## 🚀 SONUÇ VE ÖNERİ

### ✅ BU ÖZELLİK UYGULANABİLİR!

**Avantajlar:**

1. Mevcut altyapı yeterli - ek paket gerekmiyor
2. TMDB API tüm gerekli veriyi sağlıyor
3. YouTube embed API kısıtlamaları aşılabilir
4. Kullanıcı deneyimi açısından çok etkileyici olacak

**Tahmini Geliştirme Süresi:** 5-8 gün

**Risk Seviyesi:** Düşük

---

## 🎬 HEMEN BAŞLAMAK İSTER MİSİN?

Onay verirsen şu adımları sırasıyla uygulayabiliriz:

1. **Shorts servisini** oluştur (`src/services/shorts.js`)
2. **Shorts sayfasını** oluştur (`src/pages/Shorts.jsx`)
3. **React route** ekle (`/shorts`)
4. **Shorts componentlerini** oluştur
5. **Navigasyona** link ekle

---

_Bu rapor, mevcut proje yapısı analiz edilerek hazırlanmıştır._
