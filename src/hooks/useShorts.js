import { useState, useEffect, useCallback, useRef } from 'react';
import { shortsService } from '../services/shorts';

export const useShorts = () => {
  const [shorts, setShorts] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const bufferSize = 10;

  const fetchPage = useCallback(async (pageNum) => {
    if (fetchedPagesRef.current.has(pageNum) || isFetchingRef.current) return [];
    
    try {
      isFetchingRef.current = true;
      fetchedPagesRef.current.add(pageNum);
      
      const data = await shortsService.getContentWithTrailers(pageNum);
      return data;
    } catch (error) {
      fetchedPagesRef.current.delete(pageNum);
      return [];
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const initializeShorts = useCallback(async () => {
    const firstBatch = await fetchPage(1);
    
    if (firstBatch.length > 0) {
      setShorts(firstBatch);
      setIsReady(true);
      
      setTimeout(async () => {
        const secondBatch = await fetchPage(2);
        if (secondBatch.length > 0) {
          setShorts(prev => {
            const existingIds = new Set(prev.map(s => `${s.id}-${s.media_type}`));
            const newItems = secondBatch.filter(item => !existingIds.has(`${item.id}-${item.media_type}`));
            return [...prev, ...newItems];
          });
          pageRef.current = 2;
        }
      }, 100);
    }
  }, [fetchPage]);

  useEffect(() => {
    initializeShorts();
  }, [initializeShorts]);

  const loadMoreInBackground = useCallback(async () => {
    const nextPage = pageRef.current + 1;
    const newData = await fetchPage(nextPage);
    
    if (newData.length > 0) {
      setShorts(prev => {
        const existingIds = new Set(prev.map(s => `${s.id}-${s.media_type}`));
        const newItems = newData.filter(item => !existingIds.has(`${item.id}-${item.media_type}`));
        return [...prev, ...newItems];
      });
      pageRef.current = nextPage;
    }
  }, [fetchPage]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      
      if (next >= shorts.length - 15) { // Trigger earlier (at 15 remains instead of 10)
        loadMoreInBackground();
      }
      
      if (next < shorts.length) {
        return next;
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
      
      if (index >= shorts.length - bufferSize) {
        loadMoreInBackground();
      }
    }
  }, [shorts.length, loadMoreInBackground]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const prependShort = useCallback((short) => {
    setShorts(prev => {
      const exists = prev.some(s => s.id === short.id && s.media_type === short.media_type);
      if (exists) return prev;
      return [short, ...prev];
    });
    setCurrentIndex(0);
    setIsReady(true);
  }, []);

  return {
    shorts,
    isReady,
    currentIndex,
    currentShort: shorts[currentIndex] || null,
    isMuted,
    goToNext,
    goToPrevious,
    goToIndex,
    toggleMute,
    prependShort,
    hasContent: shorts.length > 0
  };
};

export default useShorts;
