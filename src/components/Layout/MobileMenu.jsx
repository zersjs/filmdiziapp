import React from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { FaHeart, FaBookmark, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaSearch } from 'react-icons/fa';
import { useAuth, getDisplayName } from '../../contexts/AuthContext';
import { useApp } from '../../contexts';
import { useBodyScrollLock, useEscapeKey } from '../UI/Modal';
import { useToast } from '../UI/Toast';

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { state } = useApp();
  const { toast } = useToast();

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) toast.info('Çıkış yapıldı');
    onClose();
  };

  const itemClass = ({ isActive }) => `sheet-item ${isActive ? 'active' : ''}`;

  return createPortal(
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Menü" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />

        {isAuthenticated ? (
          <NavLink to={`/profile/${user.id}`} className={itemClass} onClick={onClose}>
            <FaUser />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-white">{getDisplayName(user)}</span>
              <span className="block text-xs text-white/40">Profili görüntüle</span>
            </span>
          </NavLink>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2">
            <Link to="/login" className="btn btn-primary" onClick={onClose}>
              <FaSignInAlt /> Giriş yap
            </Link>
            <Link to="/register" className="btn btn-secondary" onClick={onClose}>
              <FaUserPlus /> Kayıt ol
            </Link>
          </div>
        )}

        <div className="sheet-divider" />

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

        {isAuthenticated && (
          <button type="button" onClick={handleSignOut} className="sheet-item danger">
            <FaSignOutAlt />
            <span>Çıkış yap</span>
          </button>
        )}

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
