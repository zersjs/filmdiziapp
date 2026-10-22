import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FaBookmark, FaHeart, FaHistory, FaSignOutAlt, FaCalendar, FaFilm } from 'react-icons/fa';
import { useAuth, getAvatarUrl, getDisplayName } from '../contexts/AuthContext';
import { useApp } from '../contexts';
import { bookmarksService, watchHistoryService, supabase } from '../services/supabase';
import { getImageUrl } from '../services/tmdb';
import { useToast } from '../components/UI/Toast';
import { PageLoader, Spinner } from '../components/UI/Loading';
import { EmptyState } from '../components/UI/States';
import { createSlug, formatDate, getMediaLabel } from '../utils/helpers';

const SavedGrid = ({ items }) => {
  if (!items.length) {
    return <EmptyState icon={FaFilm} title="Burada henüz bir şey yok" description="Sahneler akışında kaydettiğin içerikler burada görünür." />;
  }
  return (
    <div className="media-grid">
      {items.map(item => (
        <Link key={item.id} to={`/${item.media_type}/${item.media_id}/${createSlug(item.title)}`} className="mc">
          <div className="mc-poster">
            {item.poster_path ? (
              <img src={getImageUrl(item.poster_path, 'w342')} alt="" loading="lazy" className="mc-img loaded" />
            ) : (
              <div className="mc-placeholder"><FaFilm /><span>{item.title}</span></div>
            )}
          </div>
          <div className="mc-info">
            <h3 className="mc-title line-clamp-1">{item.title}</h3>
            <div className="mc-meta">{getMediaLabel(item.media_type)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { state } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState('bookmarks');
  const isOwnProfile = user?.id === userId;

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    enabled: isOwnProfile,
    queryFn: async () => {
      const [bookmarks, history, likes] = await Promise.all([
        bookmarksService.getBookmarks(user.id),
        watchHistoryService.getHistory(user.id, 30),
        supabase
          ? supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
          : Promise.resolve({ count: 0 }),
      ]);
      return {
        bookmarks: bookmarks.data || [],
        history: history.data || [],
        likes: likes.count || 0,
      };
    },
  });

  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: `/profile/${userId}` }} />;
  if (!isOwnProfile) return <Navigate to={`/profile/${user.id}`} replace />;

  const name = getDisplayName(user);
  const avatar = getAvatarUrl(user);
  const stats = [
    { label: 'İzleme listesi', value: state.watchLater.length, to: '/watch-later' },
    { label: 'Favori', value: state.favorites.length, to: '/favorites' },
    { label: 'Kaydedilen sahne', value: data?.bookmarks.length ?? '–' },
    { label: 'Beğeni', value: data?.likes ?? '–' },
  ];
  const tabs = [
    { id: 'bookmarks', label: 'Kaydedilenler', icon: FaBookmark, count: data?.bookmarks.length },
    { id: 'history', label: 'Geçmiş', icon: FaHistory, count: data?.history.length },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast.info('Çıkış yapıldı');
      navigate('/');
    }
  };

  return (
    <>
      <Helmet>
        <title>{name} - SINEFIX</title>
      </Helmet>

      <div className="page container-custom">
        <section className="surface p-5 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-3xl font-bold text-black">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold">{name}</h1>
              <p className="truncate text-sm text-white/45">{user.email}</p>
              {user.created_at && (
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-white/40">
                  <FaCalendar /> {formatDate(user.created_at)} tarihinden beri üye
                </p>
              )}
            </div>
            <button type="button" onClick={handleSignOut} className="btn btn-danger btn-sm">
              <FaSignOutAlt /> Çıkış yap
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-6 sm:grid-cols-4">
            {stats.map(stat => {
              const content = (
                <>
                  <dd className="text-2xl font-bold">{stat.value}</dd>
                  <dt className="mt-1 text-xs text-white/45">{stat.label}</dt>
                </>
              );
              return stat.to ? (
                <Link key={stat.label} to={stat.to} className="rounded-xl bg-white/[0.03] p-4 hover:bg-white/[0.06]">{content}</Link>
              ) : (
                <div key={stat.label} className="rounded-xl bg-white/[0.03] p-4">{content}</div>
              );
            })}
          </dl>
        </section>

        <div className="my-6 flex items-center gap-2">
          <div className="segmented">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                <Icon className="mr-1.5 inline text-[11px]" /> {label} {count !== undefined && <span className="opacity-60">{count}</span>}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <SavedGrid items={tab === 'bookmarks' ? data?.bookmarks || [] : data?.history || []} />
        )}

        <p className="mt-10 text-center text-xs text-white/30">
          <FaHeart className="mr-1 inline" /> Favoriler ve izleme listesi bu cihazdaki tarayıcında saklanır.
        </p>
      </div>
    </>
  );
};

export default Profile;
