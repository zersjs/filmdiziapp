import { useCallback, useLayoutEffect, useRef, useState } from 'react';

// Bir kapsayıcı içindeki seçili öğenin konumunu ölçer; kayan "kutu" göstergeleri
// (sekmeler, segmentler, menüler) bu konuma transform ile kayar.
// - İlk ölçümde animasyon kapalıdır (gösterge soldan kayarak gelmez), sonrakilerde açılır.
// - Kapsayıcı boyutu veya yazı tipi değişince yeniden ölçülür.
// container: position: relative olmalı (offsetLeft/Top ona göre hesaplanır).
export const useIndicator = (activeSelector) => {
  const containerRef = useRef(null);
  const [state, setState] = useState({ rect: null, animate: false });

  const measure = useCallback(() => {
    const container = containerRef.current;
    const el = activeSelector ? container?.querySelector(activeSelector) : null;
    setState(previous => {
      if (!el) return previous.rect ? { rect: null, animate: false } : previous;
      const rect = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
      const same = previous.rect
        && previous.rect.x === rect.x && previous.rect.y === rect.y
        && previous.rect.width === rect.width && previous.rect.height === rect.height;
      if (same) return previous;
      return { rect, animate: !!previous.rect };
    });
  }, [activeSelector]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return undefined;
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => measure());
      observer.observe(container);
      [...container.children].forEach(child => observer.observe(child));
    }
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => observer?.disconnect();
  }, [measure]);

  return [containerRef, state.rect, state.animate, measure];
};

// Göstergenin inline stili; ölçüm yoksa gizlenir.
export const indicatorStyle = (rect, animate, { inset = 0 } = {}) => (rect ? {
  width: rect.width - inset * 2,
  height: rect.height,
  transform: `translate3d(${rect.x + inset}px, ${rect.y}px, 0)`,
  transition: animate ? undefined : 'none',
  opacity: 1,
} : { opacity: 0 });
