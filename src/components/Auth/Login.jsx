import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useAuthStore from '../../stores/authStore';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error(t('messages.error'));
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      toast.success(t('messages.loginSuccess'));
      navigate('/');
    } else {
      toast.error(result.error || t('messages.error'));
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`);
    // Implement social login logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Title */}
        <div className="text-center">
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold text-white mb-2"
          >
            🎬 SINEFIX
          </motion.h1>
          <h2 className="text-3xl font-extrabold text-white">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="font-medium text-purple-300 hover:text-purple-200 transition"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 space-y-6 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 bg-white/20 border border-gray-300/30 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 bg-white/20 border border-gray-300/30 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-300 hover:text-white transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-200">
                {t('auth.rememberMe')}
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-purple-300 hover:text-purple-200 transition"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? t('common.loading') : t('auth.login')}
          </button>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-300">
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300/30 rounded-lg shadow-sm bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition"
              >
                <FaGoogle size={20} />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300/30 rounded-lg shadow-sm bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition"
              >
                <FaFacebook size={20} />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Twitter')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300/30 rounded-lg shadow-sm bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition"
              >
                <FaTwitter size={20} />
              </button>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
