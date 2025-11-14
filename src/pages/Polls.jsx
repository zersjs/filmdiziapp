import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPoll, FaCheck, FaChartBar, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, [filter]);

  const fetchPolls = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/polls`, { params });
      setPolls(response.data.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/polls/${pollId}/vote`, { optionIndex });
      toast.success('Vote submitted!');
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  };

  const categories = ['all', 'movie', 'series', 'actor', 'general', 'trivia', 'prediction'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FaPoll className="text-6xl text-green-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">Community Polls</h1>
          <p className="text-xl text-gray-300 mb-8">
            Share your opinion and see what others think!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll, index) => (
              <motion.div
                key={poll._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{poll.title}</h3>
                    {poll.description && (
                      <p className="text-gray-400">{poll.description}</p>
                    )}
                  </div>
                  {poll.featured && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {poll.options.map((option, idx) => {
                    const percentage = poll.totalVotes > 0
                      ? ((option.voteCount / poll.totalVotes) * 100).toFixed(1)
                      : 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVote(poll._id, idx)}
                        className="w-full relative group"
                      >
                        <div className="relative bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition-all overflow-hidden">
                          <div
                            className="absolute inset-0 bg-green-600/30 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div className="relative flex items-center justify-between">
                            <span className="text-white font-semibold">{option.text}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400">{option.voteCount} votes</span>
                              <span className="text-green-400 font-bold">{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FaChartBar className="text-green-400" />
                      {poll.totalVotes} total votes
                    </span>
                    <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                      {poll.category}
                    </span>
                  </div>
                  <span>Created by {poll.createdBy?.username}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all">
            <FaPlus />
            Create New Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default Polls;
