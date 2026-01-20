import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaUser, FaEnvelope, FaCalendar, FaHeart, FaBookmark, FaHistory,
  FaCog, FaSignOutAlt, FaFilm, FaTv, FaEdit
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { bookmarksService, watchHistoryService, likesService, supabase } from '../services/supabase';
import { getImageUrl } from '../services/tmdb';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [profileData, setProfileData] = useState(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user && userData.user.id === userId) {
          setProfileData(userData.user);
        }
      }

      if (isOwnProfile && currentUser?.id) {
        const [bookmarksRes, historyRes] = await Promise.all([
          bookmarksService.getBookmarks(currentUser.id),
          watchHistoryService.getHistory(currentUser.id, 10)
        ]);
        setBookmarks(bookmarksRes.data || []);
        setHistory(historyRes.data || []);
        
        if (supabase) {
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);
          setLikesCount(count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const tabs = [
    { id: 'bookmarks', label: 'Kaydedilenler', icon: FaBookmark, count: bookmarks.length },
    { id: 'history', label: 'İzleme Geçmişi', icon: FaHistory, count: history.length },
    { id: 'likes', label: 'Beğeniler', icon: FaHeart, count: likesCount },
  ];

  const userInfo = profileData || currentUser;
  const username = userInfo?.user_metadata?.username || userInfo?.email?.split('@')[0] || 'Kullanıcı';
  const email = userInfo?.email || '';
  const joinDate = userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
        </div>
      </div>
    );
  }

  if (!currentUser && !profileData) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <FaUser className="profile-empty-icon" />
          <h2>Profil Bulunamadı</h2>
          <p>Bu profili görüntülemek için giriş yapmanız gerekiyor.</p>
          <Link to="/login" className="profile-login-btn">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{username} | SineFix Profil</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-12 overflow-x-hidden">
        <div className="container-custom">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white text-black flex items-center justify-center text-3xl font-bold rounded-full">
                {username.charAt(0).toUpperCase()}
              </div>

              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold mb-1">{username}</h1>
                <p className="text-gray-400 mb-4">{email}</p>
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <FaCalendar /> {joinDate}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex gap-3">
                  <button className="btn-secondary text-xs">
                    <FaEdit className="mr-2" /> Düzenle
                  </button>
                  <button className="btn-secondary text-xs border-red-900/30 text-red-500 hover:bg-red-950/20" onClick={handleSignOut}>
                    <FaSignOutAlt className="mr-2" /> Çıkış
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-12 mt-12 pt-8 border-t border-[#1a1a1a] justify-center md:justify-start">
               <div className="text-center md:text-left">
                <div className="text-2xl font-bold">{bookmarks.length}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">Kaydedilen</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">İzlenen</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">{likesCount}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">Beğeni</div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-[#1a1a1a] mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    isActive ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon />
                  <span className="text-sm font-medium uppercase tracking-widest">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="profile-content">
            {(activeTab === 'bookmarks' || activeTab === 'history') && (
              <div className="movie-grid">
                {(activeTab === 'bookmarks' ? bookmarks : history).length > 0 ? (
                  (activeTab === 'bookmarks' ? bookmarks : history).map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.media_type}/${item.media_id}`}
                      className="group relative aspect-[2/3] bg-[#0a0a0a] border border-[#1a1a1a] rounded overflow-hidden"
                    >
                      <img
                        src={getImageUrl(item.poster_path, 'w342')}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="text-[10px] uppercase tracking-tighter text-gray-400 mb-1">
                          {item.media_type === 'movie' ? 'Film' : 'Dizi'}
                        </div>
                        <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center text-gray-600">
                    <p className="text-lg">Burada henüz bir şey yok.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'likes' && (
              <div className="py-24 text-center text-gray-600 border border-[#1a1a1a] border-dashed rounded-lg">
                <FaHeart className="mx-auto text-4xl mb-4 opacity-20" />
                <p className="text-lg">{likesCount} içerik beğendin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
