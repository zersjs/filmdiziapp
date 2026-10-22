// YouTube IFrame Player API yükleyicisi. Betik sayfa başına bir kez eklenir;
// engellenirse (ağ, reklam engelleyici) belirli süre sonra hata verir.

const API_URL = 'https://www.youtube.com/iframe_api';
const LOAD_TIMEOUT_MS = 12000;

let apiPromise = null;

export const loadYouTubeApi = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      apiPromise = null;
      reject(new Error('YouTube API zaman aşımı'));
    }, LOAD_TIMEOUT_MS);

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      previous?.();
      resolve(window.YT);
    };

    const script = document.createElement('script');
    script.src = API_URL;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      apiPromise = null;
      reject(new Error('YouTube API yüklenemedi'));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
};

export const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

// 2: geçersiz parametre, 5: HTML5 oynatıcı hatası, 100: video yok/özel,
// 101 ve 150: sahibi gömülü oynatmaya izin vermiyor.
export const UNPLAYABLE_ERRORS = new Set([2, 5, 100, 101, 150]);

export const youtubeThumbnail = (key, quality = 'hqdefault') => `https://i.ytimg.com/vi/${key}/${quality}.jpg`;

export const youtubeWatchUrl = (key) => `https://www.youtube.com/watch?v=${key}`;
