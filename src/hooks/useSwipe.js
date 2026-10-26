import { useEffect, useRef } from 'react';

// Yatay kaydırılabilir bir alanın (ör. içerik satırı) içinde başlayan dokunuşlar sayfa
// kaydırması sayılır, sekme değiştirmez.
const insideHorizontalScroller = (target, boundary) => {
  for (let el = target; el && el !== boundary; el = el.parentElement) {
    if (el.matches?.('input, textarea, select, iframe, [data-no-swipe]')) return true;
    if (el.scrollWidth > el.clientWidth + 1) {
      const overflow = getComputedStyle(el).overflowX;
      if (overflow === 'auto' || overflow === 'scroll') return true;
    }
  }
  return false;
};

// onSwipe(+1) sola kaydırma (ileri), onSwipe(-1) sağa kaydırma (geri).
export const useSwipe = (ref, onSwipe, { threshold = 56, ratio = 1.4 } = {}) => {
  const handler = useRef(onSwipe);
  handler.current = onSwipe;
  const enabled = !!onSwipe;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    let start = null;

    const onStart = (event) => {
      if (event.touches.length !== 1 || insideHorizontalScroller(event.target, el)) {
        start = null;
        return;
      }
      start = { x: event.touches[0].clientX, y: event.touches[0].clientY, time: Date.now() };
    };
    const onEnd = (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const quick = Date.now() - start.time < 700;
      start = null;
      if (quick && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * ratio) {
        handler.current?.(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [ref, enabled, threshold, ratio]);
};
