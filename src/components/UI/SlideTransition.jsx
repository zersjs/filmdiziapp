import React, { useEffect, useRef, useState } from 'react';
import { useSwipe } from '../../hooks/useSwipe';

// İçerik değişiminde eski panel bir yana kayarak çıkar, yenisi diğer yandan gelir.
// direction: 1 → ileri (yeni içerik sağdan), -1 → geri (soldan).
// Paneller aynı ızgara hücresinde üst üste durur; mutlak konumlandırma ve yükseklik ölçümü gerekmez.
// onSwipe verilirse dokunmatik ekranda sağa/sola kaydırma ile içerik değiştirilebilir.
const SlideTransition = ({ id, direction = 1, children, className = '', onSwipe }) => {
  const [state, setState] = useState({ id, exiting: null, direction });
  const lastChildren = useRef(children);
  const stageRef = useRef(null);
  useSwipe(stageRef, onSwipe);

  // Kimlik değiştiyse bir önceki çizimin içeriği çıkış animasyonu için saklanır.
  if (state.id !== id) {
    setState({ id, exiting: { id: state.id, node: lastChildren.current }, direction: direction || 1 });
  }

  useEffect(() => {
    lastChildren.current = children;
  });

  const dir = state.direction > 0 ? 'next' : 'prev';

  return (
    <div ref={stageRef} className={`slide-stage ${className}`}>
      {state.exiting && (
        <div
          key={state.exiting.id}
          className={`slide-panel slide-exit ${dir}`}
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setState(current => ({ ...current, exiting: null }));
          }}
        >
          {state.exiting.node}
        </div>
      )}
      <div key={id} className={`slide-panel ${state.exiting ? `slide-enter ${dir}` : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default SlideTransition;
