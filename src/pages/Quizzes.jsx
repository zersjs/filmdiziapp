import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBrain, FaTrophy, FaClock, FaStar, FaPlay } from 'react-icons/fa';
import axios from 'axios';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, [filter, difficulty]);

  const fetchQuizzes = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.category = filter;
      if (difficulty !== 'all') params.difficulty = difficulty;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/quizzes`, { params });
      setQuizzes(response.data.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'movie', 'series', 'actor', 'director', 'trivia', 'quotes'];
  const difficulties = ['all', 'easy', 'medium', 'hard', 'expert'];

  const getDifficultyColor = (diff) => {
    const colors = {
      easy: 'text-green-400 bg-green-400/20',
      medium: 'text-yellow-400 bg-yellow-400/20',
      hard: 'text-orange-400 bg-orange-400/20',
      expert: 'text-red-400 bg-red-400/20',
    };
    return colors[diff] || 'text-gray-400 bg-gray-400/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FaBrain className="text-6xl text-blue-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">Movie & TV Quizzes</h1>
          <p className="text-xl text-gray-300 mb-8">
            Test your knowledge and compete with other fans!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  difficulty === diff
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={quiz.coverImage || '/quiz-default.jpg'}
                    alt={quiz.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                  {quiz.featured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold">
                      {quiz.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {quiz.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <FaBrain />
                      {quiz.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {Math.floor(quiz.timeLimit / 60)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      {quiz.totalPoints} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-400">
                      {quiz.totalAttempts} attempts
                    </div>
                    <div className="text-sm text-gray-400">
                      Avg: {quiz.averageScore.toFixed(0)}%
                    </div>
                  </div>

                  <Link
                    to={`/quiz/${quiz._id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <FaPlay />
                    Start Quiz
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create Your Own Quiz</h2>
          <p className="text-gray-400 mb-6">
            Have a great idea for a quiz? Create your own and challenge the community!
          </p>
          <Link
            to="/create-quiz"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
          >
            Create Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
