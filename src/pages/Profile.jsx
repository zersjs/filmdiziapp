import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaHeart, FaClock, FaHistory, FaCog, FaSignOutAlt, FaEdit, FaFilm, FaTv, FaStar, FaCalendar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import { useApp } from '../contexts';
import MovieCard from '../components/UI/MovieCard';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { state } = useApp();

  const [activeTab, setActiveTab] = useState('favorites'); // favorites, watchLater, history

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast.success(t('messages.logoutSuccess'));
    navigate('/');
  };

  const stats = [
    {
      label: 'Favorites',
      value: state.favorites.length,
      icon: <FaHeart className="text-red-500" />,
      color: 'from-red-500 to-pink-500',
    },
    {
      label: 'Watch Later',
      value: state.watchLater.length,
      icon: <FaClock className="text-blue-500" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Watch History',
      value: state.watchHistory.length,
      icon: <FaHistory className="text-purple-500" />,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Continue Watching',
      value: state.continueWatching.length,
      icon: <FaFilm className="text-green-500" />,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: <FaHeart />, items: state.favorites },
    { id: 'watchLater', label: 'Watch Later', icon: <FaClock />, items: state.watchLater },
    { id: 'history', label: 'History', icon: <FaHistory />, items: state.watchHistory },
  ];

  const activeItems = tabs.find(tab => tab.id === activeTab)?.items || [];

  return (
    <>
      <Helmet>
        <title>{user?.username || 'Profile'} - SINEFIX</title>
        <meta name="description" content="Your SINEFIX profile and watchlists" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 py-12"
        >
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="container-custom relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FaUser className="text-6xl text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-lg transition">
                  <FaEdit />
                </button>
              </motion.div>

              {/* User Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 text-center md:text-left"
              >
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user?.fullName || user?.username}
                </h1>
                <p className="text-xl text-purple-300 mb-4">
                  @{user?.username}
                </p>
                {user?.bio && (
                  <p className="text-gray-300 max-w-2xl mb-4">
                    {user.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-purple-600/50 backdrop-blur rounded-full text-sm">
                    {user?.email}
                  </span>
                  <span className="px-4 py-2 bg-blue-600/50 backdrop-blur rounded-full text-sm flex items-center space-x-2">
                    <FaCalendar />
                    <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col space-y-3"
              >
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur hover:bg-white/20 rounded-lg transition"
                >
                  <FaCog />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition text-red-400"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="container-custom py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-xl`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-4xl font-bold text-white">{stat.value}</div>
                </div>
                <div className="text-white/90 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <div className="flex space-x-2 bg-gray-800/50 backdrop-blur p-2 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tab.items.length}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Grid */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeItems.length > 0 ? (
              <div className="movie-grid">
                {activeItems.map((item) => (
                  <MovieCard
                    key={`${item.id}-${item.media_type}`}
                    item={item}
                    mediaType={item.media_type}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl text-gray-600 mb-4">
                  {activeTab === 'favorites' ? <FaHeart /> : activeTab === 'watchLater' ? <FaClock /> : <FaHistory />}
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-2">
                  No {tabs.find(t => t.id === activeTab)?.label} Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start adding content to see it here
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                >
                  <FaFilm />
                  <span>Browse Content</span>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Profile;
