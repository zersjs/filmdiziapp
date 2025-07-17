import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (options = {}) => {
  const {
    threshold = 100, // Sayfa sonuna kaç pixel kala tetiklensin
    rootMargin = '0px',
    enabled = true
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef();
  const callbackRef = useRef();

  // Scroll callback'ini kaydet
  const setCallback = useCallback((callback) => {
    callbackRef.current = callback;
  }, []);

  // Intersection Observer ile scroll detection
  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isFetching && callbackRef.current) {
          setIsFetching(true);
          callbackRef.current().finally(() => {
            setIsFetching(false);
          });
        }
      },
      {
        rootMargin,
        threshold: 0.1
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [enabled, isFetching, rootMargin]);

  return {
    isFetching,
    setCallback,
    observerRef
  };
};

// Scroll pozisyonu için hook
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset
      });
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

// Sayfa sonuna gelme detection hook'u
export const useScrollToBottom = (callback, threshold = 100) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      const nearBottom = distanceFromBottom <= threshold;
      
      setIsNearBottom(nearBottom);
      
      if (nearBottom && callback) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, threshold]);

  return isNearBottom;
};