# SINEFIX - Film ve Dizi İzleme Platformu

Modern React teknolojileri ile geliştirilmiş, TMDB API kullanan Türkçe film ve dizi izleme platformu.

## 🚀 Özellikler

### 🎬 İçerik Özellikleri
- **Kapsamlı Film/Dizi Kataloğu**: TMDB API ile binlerce film ve dizi
- **Çoklu Video Provider**: VidSrc, 2Embed ve diğer streaming kaynakları
- **Türkçe Destek**: Türkçe-İngilizce fallback sistemi
- **Gelişmiş Arama**: Çoklu kategori arama (film, dizi, kişi)
- **Favori Sistemi**: Kişiselleştirilmiş favori listesi
- **İzleme Geçmişi**: Otomatik izleme takibi

### 🛠️ Teknik Özellikler
- **Modern React**: React 18 + Hooks + Context API
- **Performans**: Lazy loading, infinite scroll, debounced search
- **Responsive Tasarım**: Tailwind CSS ile mobile-first yaklaşım
- **SEO Optimizasyonu**: React Helmet ile meta tag yönetimi
- **Error Handling**: Kapsamlı hata yönetimi ve Error Boundaries
- **State Management**: Context API ile global state yönetimi
- **Custom Hooks**: Yeniden kullanılabilir hook'lar
- **Toast Notifications**: Kullanıcı geri bildirimleri
- **Modal System**: Gelişmiş modal bileşenleri

## 🏗️ Teknoloji Stack'i

### Frontend
- **React 18** - Modern React özellikleri
- **Vite** - Hızlı build tool
- **React Router DOM v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### UI/UX
- **React Icons** - İkon kütüphanesi
- **Swiper** - Touch slider
- **React Player** - Video player
- **React Lazy Load Image** - Image optimization
- **React Helmet Async** - SEO meta tags

### State & Data
- **Axios** - HTTP client
- **Context API** - State management
- **LocalStorage** - Persistent storage

### Testing
- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **Jest DOM** - DOM testing utilities

## 📁 Proje Yapısı

```
src/
├── components/          # UI bileşenleri
│   ├── Layout/         # Layout bileşenleri (Header, Footer)
│   ├── UI/             # Genel UI bileşenleri
│   └── ErrorBoundary.jsx
├── contexts/           # Context API
│   └── AppContext.js   # Global state management
├── hooks/              # Custom hooks
│   ├── useApi.js       # API çağrıları
│   ├── useFavorites.js # Favori yönetimi
│   ├── useDebounce.js  # Debounce işlemleri
│   └── ...
├── pages/              # Sayfa bileşenleri
├── services/           # API servisleri
│   ├── tmdb.js         # TMDB API
│   └── player.js       # Video player servisi
├── utils/              # Yardımcı fonksiyonlar
└── test/               # Test konfigürasyonu
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repo-url>
cd sinefix
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## 🧪 Test

```bash
# Testleri çalıştır
npm run test

# Test UI'ı
npm run test:ui

# Coverage raporu
npm run test:coverage
```

## 🏗️ Build

```bash
# Production build
npm run build

# Build'i önizle
npm run preview
```

## 📱 Özellik Detayları

### Custom Hooks
- **useApi**: API çağrıları için genel hook
- **useFavorites**: Favori yönetimi
- **useDebounce**: Arama optimizasyonu
- **useInfiniteScroll**: Sayfalama
- **useLocalStorage**: Persistent storage
- **useMediaQuery**: Responsive breakpoints

### Context Management
- **AppContext**: Global state yönetimi
- **Favorites**: Favori listesi
- **Watch History**: İzleme geçmişi
- **Settings**: Kullanıcı ayarları

### Error Handling
- **Error Boundaries**: Component hata yakalama
- **API Error Handling**: Graceful error handling
- **Toast Notifications**: Kullanıcı bildirimleri

### Performance Optimizations
- **Lazy Loading**: Image ve component lazy loading
- **Debounced Search**: Arama optimizasyonu
- **Infinite Scroll**: Sayfalama optimizasyonu
- **Memoization**: React.memo ve useMemo kullanımı

## 🎨 UI/UX Özellikleri

### Responsive Design
- Mobile-first yaklaşım
- Breakpoint-based responsive grid
- Touch-friendly interface

### Dark Theme
- Modern dark theme
- Consistent color palette
- Accessibility considerations

### Animations
- Smooth transitions
- Hover effects
- Loading states
- Skeleton screens

## 🔧 Konfigürasyon

### Vite Config
- React plugin
- Development server ayarları
- Build optimizasyonları

### Tailwind Config
- Custom color palette
- Extended theme
- Custom animations

### Test Config
- Vitest setup
- Testing utilities
- Mock configurations

## 📈 Performans

### Optimizasyonlar
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

### Metrics
- Lighthouse scores
- Core Web Vitals
- Bundle analyzer

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- [TMDB](https://www.themoviedb.org/) - Film ve dizi verileri
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool