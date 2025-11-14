import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaCrown, FaStar, FaFire } from 'react-icons/fa';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/gamification/leaderboard?timeframe=${timeframe}&limit=100`
      );
      setLeaderboard(response.data.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-400 text-3xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-3xl" />;
    if (rank === 3) return <FaMedal className="text-amber-600 text-3xl" />;
    return <span className="text-2xl font-bold text-gray-500">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-600 to-yellow-400';
    if (rank === 2) return 'from-gray-600 to-gray-400';
    if (rank === 3) return 'from-amber-700 to-amber-500';
    return 'from-gray-800 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-xl text-gray-300 mb-8">
            Compete with other cinephiles and climb to the top!
          </p>

          <div className="flex justify-center gap-4">
            {['all', 'monthly', 'weekly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  timeframe === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden bg-gradient-to-r ${getRankColor(entry.rank)} rounded-xl p-6 ${
                  entry.rank <= 3 ? 'shadow-2xl scale-105' : 'bg-gray-800/50 backdrop-blur-lg'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-16 text-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <img
                    src={entry.user?.avatar || '/default-avatar.png'}
                    alt={entry.user?.username}
                    className="w-16 h-16 rounded-full border-4 border-white/20 object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {entry.user?.username}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        {entry.totalPoints} points
                      </span>
                      <span className="flex items-center gap-1">
                        <FaFire className="text-orange-400" />
                        Level {entry.level}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {entry.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm">Total Points</div>
                  </div>
                </div>

                {entry.rank <= 3 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">How to Earn Points</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { action: 'Watch a movie/series', points: 10, icon: FaStar },
              { action: 'Write a review', points: 25, icon: FaStar },
              { action: 'Complete a quiz', points: 50, icon: FaStar },
              { action: 'Daily login streak', points: 5, icon: FaFire },
              { action: 'Create a poll', points: 15, icon: FaStar },
              { action: 'Attend an event', points: 30, icon: FaTrophy },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                  <Icon className="text-yellow-400 text-2xl mb-2" />
                  <div className="text-white font-semibold mb-1">{item.action}</div>
                  <div className="text-purple-400">+{item.points} points</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
