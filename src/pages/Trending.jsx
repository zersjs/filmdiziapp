import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaFire, FaClock, FaCalendar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { trendingService } from '../services/tmdb';
import { useApi } from '../hooks';
import MovieCard from '../components/UI/MovieCard';
import { GridSkeleton } from '../components/UI/EnhancedSkeleton';

const Trending = () => {
  const { t } = useTranslation();
  const [timeWindow, setTimeWindow] = useState('week'); // 'day' or 'week'
  const [contentType, setContentType] = useState('all'); // 'all', 'movie', 'tv'

  const { data, loading, error } = useApi(
    () => trendingService.getByType(contentType, timeWindow),
    [contentType, timeWindow]
  );

  const items = data?.results || [];

  const timeWindows = [
    { value: 'day', label: 'Today', icon: <FaClock /> },
    { value: 'week', label: 'This Week', icon: <FaCalendar /> },
  ];

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
  ];

  return (
    <>
      <Helmet>
        <title>Trending - SINEFIX</title>
        <meta name="description" content="Discover what's trending on SINEFIX. Popular movies and TV shows." />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FaFire className="text-4xl text-orange-500" />
            <h1 className="text-4xl font-bold">
              {t('common.trending')}
            </h1>
          </div>
          <p className="text-gray-400">
            Discover the most popular content right now
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Time Window Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Period
            </label>
            <div className="flex flex-wrap gap-3">
              {timeWindows.map((window) => (
                <button
                  key={window.value}
                  onClick={() => setTimeWindow(window.value)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    timeWindow === window.value
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {window.icon}
                  <span>{window.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content Type
            </label>
            <div className="flex flex-wrap gap-3">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    contentType === type.value
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-gray-400">
              Showing <span className="text-white font-semibold">{items.length}</span> trending titles
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <GridSkeleton count={20} />}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-red-500">Failed to load trending content</p>
          </motion.div>
        )}

        {/* Content Grid */}
        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="movie-grid"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard
                  item={item}
                  mediaType={item.media_type}
                  showRank={index < 10}
                  rank={index + 1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaFire className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No trending content found</p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Trending;
