import { useRef } from 'react';

// Seçim değiştiğinde, seçenek sırasına göre geçiş yönü: 1 (ileri / sağdan) veya -1 (geri / soldan).
export const useSlideDirection = (value, order) => {
  const previous = useRef(value);
  const direction = useRef(1);
  if (previous.current !== value) {
    direction.current = order.indexOf(value) >= order.indexOf(previous.current) ? 1 : -1;
    previous.current = value;
  }
  return direction.current;
};
