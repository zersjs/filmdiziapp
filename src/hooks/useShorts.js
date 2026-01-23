import { useState, useEffect, useCallback, useRef } from 'react';
import { shortsService } from '../services/shorts';

export const useShorts = () => {
  const [shorts, setShorts] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Sesli başla
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const maxItems = 80; // Maximum items to keep in memory

  const fetchPage = useCallback(async (pageNum) => {
    // Sadece fetching kontrolü yap, set kontrolü kaldırıldı
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping page:', pageNum);
      return [];
    }
    
    // Daha önce çekilmiş sayfayı tekrar çekme
    if (fetchedPagesRef.current.has(pageNum)) {
      console.log('Page already fetched:', pageNum);
      return [];
    }
    
    try {
      isFetchingRef.current = true;
      setIsLoadingMore(true);
      fetchedPagesRef.current.add(pageNum);
      
      console.log('Fetching page:', pageNum);
      const data = await shortsService.getContentWithTrailers(pageNum);
      console.log('Fetched items:', data.length);
      return data;
    } catch (error) {
      console.error('Fetch page error:', error);
      fetchedPagesRef.current.delete(pageNum);
      setError('İçerik yüklenirken hata oluştu');
      return [];
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  const initializeShorts = useCallback(async () => {
    try {
      setError(null);
      console.log('Initializing shorts...');
      
      const firstBatch = await fetchPage(1);
      
      if (firstBatch.length > 0) {
        setShorts(firstBatch);
        setIsReady(true);
        pageRef.current = 1;
        
        // Preload second and third page in background
        setTimeout(async () => {
          const secondBatch = await fetchPage(2);
          if (secondBatch.length > 0) {
            setShorts(prev => {
              const existingIds = new Set(prev.map(s => `${s.id}-${s.media_type}`));
              const newItems = secondBatch.filter(item => !existingIds.has(`${item.id}-${item.media_type}`));
              return [...prev, ...newItems];
            });
            pageRef.current = 2;
            
            // Third page
            setTimeout(async () => {
              const thirdBatch = await fetchPage(3);
              if (thirdBatch.length > 0) {
                setShorts(prev => {
                  const existingIds = new Set(prev.map(s => `${s.id}-${s.media_type}`));
                  const newItems = thirdBatch.filter(item => !existingIds.has(`${item.id}-${item.media_type}`));
                  return [...prev, ...newItems];
                });
                pageRef.current = 3;
              }
            }, 1000);
          }
        }, 500);
      } else {
        setError('Gösterilecek içerik bulunamadı');
      }
    } catch (e) {
      setError('Başlatma hatası');
      console.error('Initialize error:', e);
    }
  }, [fetchPage]);

  useEffect(() => {
    initializeShorts();
  }, [initializeShorts]);

  const loadMoreInBackground = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('Already fetching, skip loadMore');
      return;
    }
    
    const nextPage = pageRef.current + 1;
    console.log('Loading more, next page:', nextPage);
    
    const newData = await fetchPage(nextPage);
    
    if (newData.length > 0) {
      setShorts(prev => {
        const existingIds = new Set(prev.map(s => `${s.id}-${s.media_type}`));
        const newItems = newData.filter(item => !existingIds.has(`${item.id}-${item.media_type}`));
        console.log('Adding new items:', newItems.length);
        return [...prev, ...newItems];
      });
      pageRef.current = nextPage;
    }
  }, [fetchPage]);

  // Memory cleanup - remove old items when list gets too long
  const cleanupOldItems = useCallback(() => {
    setShorts(prev => {
      if (prev.length <= maxItems) return prev;
      
      // Keep items around current index
      const keepStart = Math.max(0, currentIndex - 15);
      const keepEnd = Math.min(prev.length, currentIndex + maxItems - 15);
      const cleaned = prev.slice(keepStart, keepEnd);
      
      // Adjust current index
      if (keepStart > 0) {
        setCurrentIndex(curr => curr - keepStart);
      }
      
      console.log('Cleaned up items, new length:', cleaned.length);
      return cleaned;
    });
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      const maxIndex = shorts.length - 1;
      
      // Trigger load when 5 items remaining (daha erken yükle)
      if (next >= shorts.length - 5) {
        loadMoreInBackground();
      }
      
      if (next <= maxIndex) {
        return next;
      }
      
      // Eğer sona geldiyse ve daha içerik varsa bekle
      if (next > maxIndex && !isFetchingRef.current) {
        loadMoreInBackground();
      }
      
      return prev;
    });
  }, [shorts.length, loadMoreInBackground]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < shorts.length) {
      setCurrentIndex(index);
      
      if (index >= shorts.length - 5) {
        loadMoreInBackground();
      }
    }
  }, [shorts.length, loadMoreInBackground]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const prependShort = useCallback((short) => {
    if (!short?.trailer?.key) return;
    
    setShorts(prev => {
      const exists = prev.some(s => s.id === short.id && s.media_type === short.media_type);
      if (exists) {
        // Move to front if exists
        const filtered = prev.filter(s => !(s.id === short.id && s.media_type === short.media_type));
        return [short, ...filtered];
      }
      return [short, ...prev];
    });
    setCurrentIndex(0);
    setIsReady(true);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setShorts([]);
    setCurrentIndex(0);
    pageRef.current = 1;
    fetchedPagesRef.current.clear();
    isFetchingRef.current = false;
    initializeShorts();
  }, [initializeShorts]);

  return {
    shorts,
    isReady,
    currentIndex,
    currentShort: shorts[currentIndex] || null,
    isMuted,
    error,
    isLoadingMore,
    totalCount: shorts.length,
    goToNext,
    goToPrevious,
    goToIndex,
    toggleMute,
    prependShort,
    cleanupOldItems,
    retry,
    hasContent: shorts.length > 0
  };
};

export default useShorts;
