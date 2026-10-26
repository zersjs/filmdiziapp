// TMDB tür kimlikleri ↔ Türkçe, değişmeyen URL parçaları.
// Tür sayfaları /movies/genre/<slug> ve /series/genre/<slug> adreslerinde yaşar;
// slug'ların sabit olması arama motorlarındaki adreslerin kırılmamasını sağlar.

export const GENRES = {
  movie: [
    { id: 28, slug: 'aksiyon', name: 'Aksiyon' },
    { id: 12, slug: 'macera', name: 'Macera' },
    { id: 16, slug: 'animasyon', name: 'Animasyon' },
    { id: 35, slug: 'komedi', name: 'Komedi' },
    { id: 80, slug: 'suc', name: 'Suç' },
    { id: 99, slug: 'belgesel', name: 'Belgesel' },
    { id: 18, slug: 'dram', name: 'Dram' },
    { id: 10751, slug: 'aile', name: 'Aile' },
    { id: 14, slug: 'fantastik', name: 'Fantastik' },
    { id: 36, slug: 'tarih', name: 'Tarih' },
    { id: 27, slug: 'korku', name: 'Korku' },
    { id: 10402, slug: 'muzik', name: 'Müzik' },
    { id: 9648, slug: 'gizem', name: 'Gizem' },
    { id: 10749, slug: 'romantik', name: 'Romantik' },
    { id: 878, slug: 'bilim-kurgu', name: 'Bilim-Kurgu' },
    { id: 10770, slug: 'tv-filmi', name: 'TV film' },
    { id: 53, slug: 'gerilim', name: 'Gerilim' },
    { id: 10752, slug: 'savas', name: 'Savaş' },
    { id: 37, slug: 'vahsi-bati', name: 'Vahşi Batı' },
  ],
  tv: [
    { id: 10759, slug: 'aksiyon-macera', name: 'Aksiyon & Macera' },
    { id: 16, slug: 'animasyon', name: 'Animasyon' },
    { id: 35, slug: 'komedi', name: 'Komedi' },
    { id: 80, slug: 'suc', name: 'Suç' },
    { id: 99, slug: 'belgesel', name: 'Belgesel' },
    { id: 18, slug: 'dram', name: 'Dram' },
    { id: 10751, slug: 'aile', name: 'Aile' },
    { id: 10762, slug: 'cocuk', name: 'Çocuklar' },
    { id: 9648, slug: 'gizem', name: 'Gizem' },
    { id: 10763, slug: 'haber', name: 'Haber' },
    { id: 10764, slug: 'gerceklik', name: 'Gerçeklik' },
    { id: 10765, slug: 'bilim-kurgu-fantazi', name: 'Bilim Kurgu & Fantazi' },
    { id: 10766, slug: 'pembe-dizi', name: 'Pembe Dizi' },
    { id: 10767, slug: 'talk-show', name: 'Talk' },
    { id: 10768, slug: 'savas-politik', name: 'Savaş & Politik' },
    { id: 37, slug: 'vahsi-bati', name: 'Vahşi Batı' },
  ],
};

export const genreBySlug = (mediaType, slug) => GENRES[mediaType]?.find(g => g.slug === slug) || null;

export const genreById = (mediaType, id) => GENRES[mediaType]?.find(g => g.id === Number(id)) || null;

export const genrePath = (mediaType, genre) =>
  `${mediaType === 'tv' ? '/series' : '/movies'}/genre/${genre.slug}`;

// "Aksiyon filmleri", "Dram dizileri"
export const genreHeading = (mediaType, genre) =>
  `${genre.name} ${mediaType === 'tv' ? 'dizileri' : 'filmleri'}`;
