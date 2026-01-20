import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    setMatches(media.matches);

    const listener = (event) => {
      setMatches(event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

export const useBreakpoint = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop
  };
};

export const useDarkMode = () => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

export const useReducedMotion = () => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};
