import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { movieService, tvService } from '../services/tmdb';
import {
  blockedTrailers, createRandom, createShortsEngine, createSources, getSessionSeed, parseShortSlug,
  pickShortTrailer, seenShorts, shortKey,
} from '../services/shorts';
import { detailQueryOptions } from './useTmdb';
import { useApp } from '../contexts';

const BUFFER_AHEAD = 5;
const PREVIEW_KEY = ['shorts-preview'];
const DAY = 24 * 60 * 60 * 1000;

// Bir adayın videolarını getir (önbellekli) ve en uygun fragmanı seç.
const resolveTrailer = async (queryClient, item) => {
  const videos = await queryClient.fetchQuery({
    queryKey: ['videos', item.media_type, String(item.id)],
    queryFn: () => (item.media_type === 'tv' ? tvService : movieService)
      .getVideos(item.id)
      .then(response => response.data.results || []),
    staleTime: DAY,
  });
  return pickShortTrailer(videos, blockedTrailers.values());
};

// Derin bağlantıyla gelinen tek bir yapımı (detay önbelleğini paylaşarak) yükle.
const loadSingleShort = async (queryClient, { id, mediaType }) => {
  const detail = await queryClient.fetchQuery({ ...detailQueryOptions(mediaType, id), staleTime: 5 * 60 * 1000 });
  const trailer = pickShortTrailer(detail.videos?.results, blockedTrailers.values());
  if (!trailer) return null;
  return {
    ...detail,
    media_type: mediaType,
    genre_ids: detail.genres?.map(g => g.id) || [],
    trailer,
  };
};

const useEngine = () => {
  const queryClient = useQueryClient();
  const { state } = useApp();
  const libraryRef = useRef(state);

  // Motor sayfa ömrü boyunca bir kez oluşturulur (kitaplık anlık görüntüsüyle kişiselleştirilir).
  return useMemo(() => createShortsEngine({
    sources: createSources(libraryRef.current),
    resolveTrailer: (item) => resolveTrailer(queryClient, item),
    isExcluded: (item) => seenShorts.has(shortKey(item)),
    random: createRandom(getSessionSeed()),
  }), [queryClient]);
};

// Ana sayfadaki "Sahneler" satırı. Sonuçlar önbelleğe yazılır; akış sayfası
// aynı öğelerle anında başlar.
export const useShortsPreview = (count = 10) => {
  const engine = useEngine();
  return useQuery({
    queryKey: PREVIEW_KEY,
    queryFn: () => engine.take(count),
    staleTime: 15 * 60 * 1000,
  });
};

export const useShortsFeed = (slug) => {
  const queryClient = useQueryClient();
  const engine = useEngine();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | end | empty | error | stalled
  const [notice, setNotice] = useState(null);
  const itemsRef = useRef([]);
  const target = useRef(0);
  const running = useRef(false);

  const append = useCallback((incoming) => {
    const keys = new Set(itemsRef.current.map(shortKey));
    const fresh = [];
    for (const item of incoming) {
      if (!item || keys.has(shortKey(item))) continue;
      keys.add(shortKey(item));
      fresh.push(item);
    }
    if (!fresh.length) return;
    fresh.forEach(engine.markServed);
    itemsRef.current = [...itemsRef.current, ...fresh];
    setItems(itemsRef.current);
  }, [engine]);

  const pump = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      while (itemsRef.current.length < target.current) {
        const batch = await engine.take(Math.min(4, target.current - itemsRef.current.length));
        if (!batch.length) {
          setStatus(itemsRef.current.length ? 'end' : 'empty');
          break;
        }
        append(batch);
        setStatus('ready');
      }
    } catch {
      setStatus(itemsRef.current.length ? 'stalled' : 'error');
    } finally {
      running.current = false;
    }
  }, [engine, append]);

  // Aktif sahnenin önünde her zaman BUFFER_AHEAD hazır sahne tut.
  const ensureAhead = useCallback((index) => {
    const needed = index + 1 + BUFFER_AHEAD;
    if (needed > target.current) {
      target.current = needed;
      pump();
    }
  }, [pump]);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      const preview = queryClient.getQueryData(PREVIEW_KEY) || [];
      const parsed = parseShortSlug(slug);
      let first = null;
      if (parsed) {
        first = preview.find(item => item.id === parsed.id && item.media_type === parsed.mediaType) ||
          await loadSingleShort(queryClient, parsed).catch(() => null);
        if (!first && !cancelled) setNotice('Bu yapımın oynatılabilir bir fragmanı bulunamadı; akıştan devam ediliyor.');
      }
      if (cancelled) return;
      append([first, ...preview]);
      if (itemsRef.current.length) setStatus('ready');
      ensureAhead(0);
    };
    start();
    return () => {
      cancelled = true;
    };
    // Yalnızca ilk açılışta çalışır; sonraki slug değişiklikleri akışın kendi URL güncellemesidir.
  }, []);

  const retry = useCallback(() => {
    setStatus('loading');
    pump();
  }, [pump]);

  return { items, status, notice, dismissNotice: () => setNotice(null), ensureAhead, retry };
};
