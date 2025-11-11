import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import authAPI from '../api/auth';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed. The link may be expired or invalid.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, navigate]);

  return (
    <>
      <Helmet>
        <title>Verify Email - SINEFIX</title>
        <meta name="description" content="Verify your email address" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center"
        >
          {status === 'verifying' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-6"
              >
                <FaSpinner className="text-6xl text-purple-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-300">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-6"
              >
                <div className="inline-block p-6 bg-green-500 rounded-full">
                  <FaCheckCircle className="text-6xl text-white" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Email Verified!
              </h2>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
              >
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-6"
              >
                <div className="inline-block p-6 bg-red-500 rounded-full">
                  <FaTimesCircle className="text-6xl text-white" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Verification Failed
              </h2>
              <p className="text-gray-300 mb-8">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Register Again
                </Link>
                <Link
                  to="/"
                  className="block w-full px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition"
                >
                  Go to Home
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default VerifyEmail;
