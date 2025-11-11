import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaBell, FaLock, FaGlobe, FaPalette, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import useThemeStore from '../stores/themeStore';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    email: user?.email || '',
  });

  const [notifications, setNotifications] = useState({
    email: user?.settings?.notifications?.email ?? true,
    push: user?.settings?.notifications?.push ?? true,
    newReleases: user?.settings?.notifications?.newReleases ?? true,
    recommendations: user?.settings?.notifications?.recommendations ?? true,
  });

  const [privacy, setPrivacy] = useState({
    showWatchHistory: user?.settings?.privacy?.showWatchHistory ?? true,
    showFavorites: user?.settings?.privacy?.showFavorites ?? true,
    allowFollow: user?.settings?.privacy?.allowFollow ?? true,
    activityVisible: user?.settings?.privacy?.activityVisible ?? true,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const handleSaveProfile = () => {
    updateUser(formData);
    toast.success('Profile updated successfully!');
  };

  const handleSaveSettings = () => {
    // Save settings to user profile
    updateUser({
      settings: {
        ...user?.settings,
        notifications,
        privacy,
        theme,
      },
    });
    toast.success('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'privacy', label: 'Privacy', icon: <FaLock /> },
    { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
    { id: 'language', label: 'Language', icon: <FaGlobe /> },
  ];

  return (
    <>
      <Helmet>
        <title>Settings - SINEFIX</title>
        <meta name="description" content="Manage your SINEFIX account settings" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition"
            >
              <FaArrowLeft />
              <span>Back to Profile</span>
            </button>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-gray-800 rounded-xl p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                    >
                      <FaSave />
                      <span>Save Profile</span>
                    </button>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

                    <ToggleOption
                      label="Email Notifications"
                      description="Receive email notifications about your account"
                      checked={notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                    />

                    <ToggleOption
                      label="Push Notifications"
                      description="Receive push notifications in your browser"
                      checked={notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                    />

                    <ToggleOption
                      label="New Releases"
                      description="Get notified about new movies and TV shows"
                      checked={notifications.newReleases}
                      onChange={() => handleNotificationToggle('newReleases')}
                    />

                    <ToggleOption
                      label="Recommendations"
                      description="Receive personalized content recommendations"
                      checked={notifications.recommendations}
                      onChange={() => handleNotificationToggle('recommendations')}
                    />

                    <button
                      onClick={handleSaveSettings}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                    >
                      <FaSave />
                      <span>Save Settings</span>
                    </button>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>

                    <ToggleOption
                      label="Show Watch History"
                      description="Allow others to see your watch history"
                      checked={privacy.showWatchHistory}
                      onChange={() => handlePrivacyToggle('showWatchHistory')}
                    />

                    <ToggleOption
                      label="Show Favorites"
                      description="Make your favorites list public"
                      checked={privacy.showFavorites}
                      onChange={() => handlePrivacyToggle('showFavorites')}
                    />

                    <ToggleOption
                      label="Allow Follow"
                      description="Let other users follow you"
                      checked={privacy.allowFollow}
                      onChange={() => handlePrivacyToggle('allowFollow')}
                    />

                    <ToggleOption
                      label="Activity Visible"
                      description="Show your activity to followers"
                      checked={privacy.activityVisible}
                      onChange={() => handlePrivacyToggle('activityVisible')}
                    />

                    <button
                      onClick={handleSaveSettings}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                    >
                      <FaSave />
                      <span>Save Settings</span>
                    </button>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Appearance</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {['dark', 'light', 'auto'].map((themeOption) => (
                          <button
                            key={themeOption}
                            onClick={() => setTheme(themeOption)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              theme === themeOption
                                ? 'border-purple-600 bg-purple-600/20'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-4xl mb-2">
                              {themeOption === 'dark' ? '🌙' : themeOption === 'light' ? '☀️' : '🌓'}
                            </div>
                            <div className="font-medium capitalize">{themeOption}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                    >
                      <FaSave />
                      <span>Save Settings</span>
                    </button>
                  </div>
                )}

                {/* Language Tab */}
                {activeTab === 'language' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Language & Region</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Display Language
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
                          { code: 'en', name: 'English', flag: '🇺🇸' },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => i18n.changeLanguage(lang.code)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              i18n.language === lang.code
                                ? 'border-purple-600 bg-purple-600/20'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-4xl mb-2">{lang.flag}</div>
                            <div className="font-medium">{lang.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                    >
                      <FaSave />
                      <span>Save Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

// Toggle Option Component
const ToggleOption = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
          checked ? 'bg-purple-600' : 'bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
            checked ? 'transform translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default Settings;
