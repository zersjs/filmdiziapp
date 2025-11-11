import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaFilm } from 'react-icons/fa';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | SINEFIX</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
        <div className="text-center">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[200px] font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-400 max-w-md mx-auto">
              The page you're looking for seems to have gone on a coffee break. It might be lost in the multiverse!
            </p>
          </motion.div>

          {/* Animated Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mb-12"
          >
            <div className="inline-block p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl">
              <FaFilm className="text-6xl text-white" />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaHome />
              <span className="font-semibold">Go Home</span>
            </Link>

            <Link
              to="/search"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 border-2 border-purple-600 text-purple-400 rounded-lg hover:bg-purple-600/20 transition-all duration-200 transform hover:scale-105"
            >
              <FaSearch />
              <span className="font-semibold">Search Movies</span>
            </Link>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-gray-500 text-sm"
          >
            <p>💡 Did you know? The 404 error was named after room 404 at CERN where the first web servers were located.</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
