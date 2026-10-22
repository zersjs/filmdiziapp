// Klavye kısayolları yazı alanlarında devre dışı kalır.
export const isTypingTarget = (target) =>
  !!target?.closest?.('input, textarea, select, [contenteditable="true"]');

// Düğmeye kısa bir "pop" animasyonu uygular; art arda tıklamalarda yeniden başlar.
export const pop = (element) => {
  if (!element) return;
  element.classList.remove('pop');
  void element.offsetWidth; // animasyonu sıfırlamak için yeniden yerleşim
  element.classList.add('pop');
  element.addEventListener('animationend', () => element.classList.remove('pop'), { once: true });
};

// "/movie/550/dovus-kulubu-izle" → "/movie/550"; "/movies/genre/aksiyon" → "/movies".
// Aynı içerik içinde (slug, tür, sahne değişimi) sayfa yeniden kurulmaz, geçiş animasyonu oynamaz.
export const routeKey = (pathname) => {
  const parts = pathname.split('/');
  const idIndex = parts.findIndex(part => /^\d+$/.test(part));
  return idIndex > 0 ? parts.slice(0, idIndex + 1).join('/') : `/${parts[1] || ''}`;
};
