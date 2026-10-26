import React from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { FaHeart, FaBookmark, FaSearch, FaCog, FaMagic, FaEye } from 'react-icons/fa';
import { useApp } from '../../contexts';
import { useBodyScrollLock, useEscapeKey } from '../UI/Modal';

const MobileMenu = ({ isOpen, onClose }) => {
  const { state, sync } = useApp();

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const itemClass = ({ isActive }) => `sheet-item ${isActive ? 'active' : ''}`;

  return createPortal(
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Menü" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />

        <NavLink to="/ne-izlesem" className={itemClass} onClick={onClose}>
          <FaMagic />
          <span className="flex-1">Ne izlesem?</span>
        </NavLink>
        <NavLink to="/search" className={itemClass} onClick={onClose}>
          <FaSearch />
          <span className="flex-1">Ara</span>
        </NavLink>
        <NavLink to="/watch-later" className={itemClass} onClick={onClose}>
          <FaBookmark />
          <span className="flex-1">İzleme listem</span>
          {state.watchLater.length > 0 && <span className="text-sm text-white/40">{state.watchLater.length}</span>}
        </NavLink>
        <NavLink to="/favorites" className={itemClass} onClick={onClose}>
          <FaHeart />
          <span className="flex-1">Favorilerim</span>
          {state.favorites.length > 0 && <span className="text-sm text-white/40">{state.favorites.length}</span>}
        </NavLink>
        <NavLink to="/izlediklerim" className={itemClass} onClick={onClose}>
          <FaEye />
          <span className="flex-1">İzlediklerim</span>
          {state.watched.length > 0 && <span className="text-sm text-white/40">{state.watched.length}</span>}
        </NavLink>
        <NavLink to="/ayarlar" className={itemClass} onClick={onClose}>
          <FaCog />
          <span className="min-w-0 flex-1">
            <span className="block">Kitaplık ve senkronizasyon</span>
            <span className="block text-xs text-white/40">
              {sync.enabled ? 'Cihazlar arası eşitleme açık' : 'Listelerin bu cihazda saklanıyor'}
            </span>
          </span>
        </NavLink>

        <div className="sheet-divider" />

        <div className="sheet-links">
          <Link to="/sss" onClick={onClose}>SSS</Link>
          <Link to="/iletisim" onClick={onClose}>İletişim</Link>
          <Link to="/gizlilik-politikasi" onClick={onClose}>Gizlilik</Link>
          <Link to="/kullanim-kosullari" onClick={onClose}>Kullanım koşulları</Link>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileMenu;
