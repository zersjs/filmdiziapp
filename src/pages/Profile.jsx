import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaLink,
  FaTwitter, FaInstagram, FaFacebook, FaCog, FaTrophy,
  FaStar, FaFilm, FaTv, FaHeart, FaUsers
} from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`),
        axios.get(`${import.meta.env.VITE_API_URL}/gamification/leaderboard/${userId}`)
      ]);
      setUser(userRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'activity', label: 'Activity', icon: FaStar },
    { id: 'watchlist', label: 'Watchlist', icon: FaFilm },
    { id: 'favorites', label: 'Favorites', icon: FaHeart },
    { id: 'followers', label: 'Followers', icon: FaUsers },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.username}
                className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2">
                <FaTrophy className="text-yellow-400 text-xl" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{user?.username}</h1>
              <p className="text-gray-400 mb-4">{user?.bio || 'No bio yet'}</p>

              <div className="flex flex-wrap gap-4 text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-purple-500" />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                {user?.location && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-purple-500" />
                    <span>{user.location.city}, {user.location.country}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                {user?.socialLinks?.twitter && (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                     className="text-blue-400 hover:text-blue-300">
                    <FaTwitter className="text-2xl" />
                  </a>
                )}
                {user?.socialLinks?.instagram && (
                  <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                     className="text-pink-400 hover:text-pink-300">
                    <FaInstagram className="text-2xl" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.stats?.moviesWatched || 0}</div>
                  <div className="text-gray-400 text-sm">Movies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.stats?.seriesWatched || 0}</div>
                  <div className="text-gray-400 text-sm">Series</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.stats?.reviewsWritten || 0}</div>
                  <div className="text-gray-400 text-sm">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.stats?.followersCount || 0}</div>
                  <div className="text-gray-400 text-sm">Followers</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
                Follow
              </button>
              <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all">
                Message
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FaTrophy, label: 'Level', value: stats?.level || 1, color: 'yellow' },
            { icon: FaStar, label: 'Points', value: stats?.totalPoints || 0, color: 'purple' },
            { icon: FaFilm, label: 'Badges', value: stats?.stats?.badgesEarned || 0, color: 'blue' },
            { icon: FaUsers, label: 'Rank', value: `#${stats?.rank || 'N/A'}`, color: 'green' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 text-center"
              >
                <Icon className={`text-4xl text-${stat.color}-500 mx-auto mb-2`} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">About</h3>
                <p className="text-gray-400 mb-6">{user?.bio || 'No information available'}</p>

                <h3 className="text-2xl font-bold text-white mb-4">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.preferences?.favoriteGenres?.map((genre, idx) => (
                    <span key={idx} className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full">
                      {genre}
                    </span>
                  )) || <span className="text-gray-400">No favorite genres set</span>}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center text-gray-400 py-8">
                Recent activity will be displayed here
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="text-center text-gray-400 py-8">
                Watchlist items will be displayed here
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-center text-gray-400 py-8">
                Favorite items will be displayed here
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="text-center text-gray-400 py-8">
                Followers list will be displayed here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
