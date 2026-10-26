import React from 'react';
import Modal from './Modal';

export const GO_SHORTCUTS = {
  h: { path: '/', label: 'Ana sayfa' },
  f: { path: '/movies', label: 'Filmler' },
  d: { path: '/series', label: 'Diziler' },
  s: { path: '/sahneler', label: 'Sahneler' },
  n: { path: '/ne-izlesem', label: 'Ne izlesem?' },
  l: { path: '/watch-later', label: 'İzleme listem' },
};

const GROUPS = [
  {
    title: 'Genel',
    items: [
      [['/'], 'Ara'],
      [['Ctrl', 'K'], 'Aramayı aç / kapat'],
      [['?'], 'Bu pencere'],
      ...Object.entries(GO_SHORTCUTS).map(([key, { label }]) => [['g', key], label]),
    ],
  },
  {
    title: 'Film ve dizi sayfası',
    items: [
      [['t'], 'Fragmanı oynat'],
      [['l'], 'İzleme listesine ekle / çıkar'],
      [['f'], 'Favorilere ekle / çıkar'],
      [['w'], 'Filmi izledim olarak işaretle'],
    ],
  },
  {
    title: 'Sahneler',
    items: [
      [['↓'], 'Sonraki (veya j)'],
      [['↑'], 'Önceki (veya k)'],
      [['Boşluk'], 'Duraklat / oynat'],
      [['m'], 'Sesi aç / kapat'],
    ],
  },
];

const ShortcutsModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Klavye kısayolları" size="medium">
    <div className="grid gap-6 sm:grid-cols-2">
      {GROUPS.map(group => (
        <section key={group.title} className={group.title === 'Genel' ? 'sm:row-span-2' : ''}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">{group.title}</h3>
          <dl className="space-y-2">
            {group.items.map(([keys, label]) => (
              <div key={label} className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-white/75">{label}</dt>
                <dd className="flex flex-shrink-0 items-center gap-1">
                  {keys.map((key, index) => (
                    <React.Fragment key={key}>
                      {index > 0 && <span className="text-[11px] text-white/30">{keys[0] === 'g' ? 'sonra' : '+'}</span>}
                      <kbd>{key}</kbd>
                    </React.Fragment>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  </Modal>
);

export default ShortcutsModal;
