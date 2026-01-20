import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (options = {}) => {
  const {
    threshold = 100, 
    rootMargin = '0px',
    enabled = true
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef();
  const callbackRef = useRef();

  const setCallback = useCallback((callback) => {
    callbackRef.current = callback;
  }, []);

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

export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    let ticking = false;

    const updatePosition = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updatePosition();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

export const useScrollToBottom = (callback, threshold = 100) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    let ticking = false;

    const checkScrollPosition = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      const nearBottom = distanceFromBottom <= threshold;

      setIsNearBottom(nearBottom);

      if (nearBottom && callback) {
        callback();
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, threshold]);

  return isNearBottom;
};
