import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTimes, FaHeart, FaClock, FaUser, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, signOut, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <span className="text-xl font-bold uppercase tracking-widest italic">SINEFIX</span>
          <button className="mobile-menu-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="mobile-menu-body">
          <NavLink to="/search" className="mobile-menu-item" onClick={onClose}>
            <FaSearch />
            <span>Arama Yap</span>
          </NavLink>
          
          <NavLink to="/favorites" className="mobile-menu-item" onClick={onClose}>
            <FaHeart />
            <span>Favorilerim</span>
          </NavLink>

          <NavLink to="/watch-later" className="mobile-menu-item" onClick={onClose}>
            <FaClock />
            <span>İzleme Listem</span>
          </NavLink>

          {isAuthenticated ? (
            <>
              <div className="mobile-menu-divider" />
              <NavLink to={`/profile/${user?.id}`} className="mobile-menu-item profile-nav-item" onClick={onClose}>
                <div className="mobile-menu-avatar">
                  {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                    <img 
                      src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="mobile-menu-user-info">
                  <span className="user-name">{user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                  <span className="user-view-profile">Profili Görüntüle</span>
                </div>
              </NavLink>
              <button onClick={handleSignOut} className="mobile-menu-item text-red-500 mt-2">
                <FaSignOutAlt />
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider" />
              <NavLink to="/login" className="mobile-menu-item" onClick={onClose}>
                <FaSignOutAlt />
                <span>Giriş Yap</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="mobile-menu-footer">
          <p>© 2026 SINEFIX PREMIUM</p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
