import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  tr: {
    translation: {
      // Navigation
      nav: {
        home: 'Ana Sayfa',
        movies: 'Filmler',
        series: 'Diziler',
        search: 'Ara',
        myList: 'Listem',
        favorites: 'Favoriler',
        watchLater: 'Sonra İzle',
        history: 'Geçmiş',
        profile: 'Profil',
        settings: 'Ayarlar',
        logout: 'Çıkış Yap',
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
      },

      // Auth
      auth: {
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        email: 'E-posta',
        password: 'Şifre',
        username: 'Kullanıcı Adı',
        fullName: 'Ad Soyad',
        confirmPassword: 'Şifre Tekrar',
        forgotPassword: 'Şifremi Unuttum',
        rememberMe: 'Beni Hatırla',
        alreadyHaveAccount: 'Hesabınız var mı?',
        dontHaveAccount: 'Hesabınız yok mu?',
        orContinueWith: 'Veya şununla devam et',
        signInWithGoogle: 'Google ile Giriş Yap',
        signInWithFacebook: 'Facebook ile Giriş Yap',
        signInWithTwitter: 'Twitter ile Giriş Yap',
      },

      // Common
      common: {
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        edit: 'Düzenle',
        close: 'Kapat',
        search: 'Ara',
        filter: 'Filtrele',
        sortBy: 'Sırala',
        seeAll: 'Tümünü Gör',
        seeMore: 'Daha Fazla',
        watchNow: 'Şimdi İzle',
        addToList: 'Listeye Ekle',
        removeFromList: 'Listeden Çıkar',
        share: 'Paylaş',
        rating: 'Puan',
        reviews: 'İncelemeler',
        cast: 'Oyuncular',
        crew: 'Ekip',
        similar: 'Benzer',
        recommended: 'Önerilen',
        trending: 'Trend',
        popular: 'Popüler',
        topRated: 'En İyi',
        upcoming: 'Yakında',
        nowPlaying: 'Vizyonda',
      },

      // Content
      content: {
        movies: 'Filmler',
        series: 'Diziler',
        episodes: 'Bölümler',
        seasons: 'Sezonlar',
        genres: 'Türler',
        releaseDate: 'Yayın Tarihi',
        runtime: 'Süre',
        overview: 'Özet',
        trailer: 'Fragman',
        images: 'Görseller',
        videos: 'Videolar',
        budget: 'Bütçe',
        revenue: 'Hasılat',
        status: 'Durum',
        language: 'Dil',
        country: 'Ülke',
      },

      // User
      user: {
        profile: 'Profil',
        settings: 'Ayarlar',
        notifications: 'Bildirimler',
        subscription: 'Abonelik',
        billing: 'Faturalama',
        privacy: 'Gizlilik',
        security: 'Güvenlik',
        language: 'Dil',
        theme: 'Tema',
        darkMode: 'Karanlık Mod',
        lightMode: 'Aydınlık Mod',
        autoMode: 'Otomatik',
      },

      // Messages
      messages: {
        loginSuccess: 'Başarıyla giriş yapıldı',
        logoutSuccess: 'Başarıyla çıkış yapıldı',
        registerSuccess: 'Kayıt başarılı',
        updateSuccess: 'Güncelleme başarılı',
        deleteSuccess: 'Silme başarılı',
        addedToList: 'Listeye eklendi',
        removedFromList: 'Listeden çıkarıldı',
        error: 'Bir hata oluştu',
        networkError: 'Bağlantı hatası',
        unauthorized: 'Yetkisiz erişim',
        notFound: 'Bulunamadı',
      },
    },
  },

  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        movies: 'Movies',
        series: 'TV Shows',
        search: 'Search',
        myList: 'My List',
        favorites: 'Favorites',
        watchLater: 'Watch Later',
        history: 'History',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        register: 'Sign Up',
      },

      // Auth
      auth: {
        login: 'Login',
        register: 'Sign Up',
        email: 'Email',
        password: 'Password',
        username: 'Username',
        fullName: 'Full Name',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password',
        rememberMe: 'Remember Me',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
        orContinueWith: 'Or continue with',
        signInWithGoogle: 'Sign in with Google',
        signInWithFacebook: 'Sign in with Facebook',
        signInWithTwitter: 'Sign in with Twitter',
      },

      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        search: 'Search',
        filter: 'Filter',
        sortBy: 'Sort By',
        seeAll: 'See All',
        seeMore: 'See More',
        watchNow: 'Watch Now',
        addToList: 'Add to List',
        removeFromList: 'Remove from List',
        share: 'Share',
        rating: 'Rating',
        reviews: 'Reviews',
        cast: 'Cast',
        crew: 'Crew',
        similar: 'Similar',
        recommended: 'Recommended',
        trending: 'Trending',
        popular: 'Popular',
        topRated: 'Top Rated',
        upcoming: 'Upcoming',
        nowPlaying: 'Now Playing',
      },

      // Content
      content: {
        movies: 'Movies',
        series: 'TV Shows',
        episodes: 'Episodes',
        seasons: 'Seasons',
        genres: 'Genres',
        releaseDate: 'Release Date',
        runtime: 'Runtime',
        overview: 'Overview',
        trailer: 'Trailer',
        images: 'Images',
        videos: 'Videos',
        budget: 'Budget',
        revenue: 'Revenue',
        status: 'Status',
        language: 'Language',
        country: 'Country',
      },

      // User
      user: {
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
        subscription: 'Subscription',
        billing: 'Billing',
        privacy: 'Privacy',
        security: 'Security',
        language: 'Language',
        theme: 'Theme',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        autoMode: 'Auto',
      },

      // Messages
      messages: {
        loginSuccess: 'Successfully logged in',
        logoutSuccess: 'Successfully logged out',
        registerSuccess: 'Registration successful',
        updateSuccess: 'Update successful',
        deleteSuccess: 'Delete successful',
        addedToList: 'Added to list',
        removedFromList: 'Removed from list',
        error: 'An error occurred',
        networkError: 'Network error',
        unauthorized: 'Unauthorized access',
        notFound: 'Not found',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
