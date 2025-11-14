import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaCrown, FaStar, FaRocket } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/subscriptions/me`);
      setCurrentSubscription(response.data.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, quarterly: 0, yearly: 0 },
      icon: FaStar,
      color: 'gray',
      features: [
        'Limited content access',
        'SD quality',
        '1 device',
        'Ads included',
        'Basic support',
      ],
    },
    {
      name: 'Basic',
      price: { monthly: 9.99, quarterly: 24.99, yearly: 89.99 },
      icon: FaCheck,
      color: 'blue',
      features: [
        'Full content library',
        'HD quality',
        '2 devices',
        'Limited ads',
        'Email support',
        'Download for offline',
      ],
    },
    {
      name: 'Premium',
      price: { monthly: 14.99, quarterly: 39.99, yearly: 139.99 },
      icon: FaCrown,
      color: 'purple',
      popular: true,
      features: [
        'All Basic features',
        '4K Ultra HD',
        '4 devices',
        'No ads',
        'Priority support',
        'Early access to new releases',
        'Exclusive content',
      ],
    },
    {
      name: 'Ultra',
      price: { monthly: 19.99, quarterly: 49.99, yearly: 179.99 },
      icon: FaRocket,
      color: 'gold',
      features: [
        'All Premium features',
        '8K quality',
        'Unlimited devices',
        'VIP support 24/7',
        'Behind-the-scenes content',
        'Live streaming events',
        'Custom playlists',
        'Family sharing',
      ],
    },
  ];

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/subscriptions/create`, {
        plan: plan.name.toLowerCase(),
        billingCycle: selectedPlan,
      });
      toast.success(`Successfully subscribed to ${plan.name}!`);
      fetchCurrentSubscription();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Unlock unlimited entertainment with our flexible subscription plans
          </p>

          {currentSubscription && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 max-w-md mx-auto mb-8">
              <p className="text-green-400">
                Current Plan: <strong>{currentSubscription.plan}</strong>
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4 mb-8">
            {['monthly', 'quarterly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPlan(period)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedPlan === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
                {period === 'yearly' && (
                  <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded">
                    Save 25%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 ${
                  plan.popular
                    ? 'border-purple-500 scale-105 shadow-2xl shadow-purple-500/50'
                    : 'border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <Icon className={`text-5xl text-${plan.color}-500 mx-auto mb-4`} />
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    ${plan.price[selectedPlan]}
                    <span className="text-lg text-gray-400 font-normal">
                      /{selectedPlan === 'yearly' ? 'year' : selectedPlan === 'quarterly' ? 'quarter' : 'month'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading || plan.name === 'Free'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : plan.name === 'Free'
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {plan.name === 'Free' ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time without any penalties.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and cryptocurrency.',
              },
              {
                q: 'Can I change my plan later?',
                a: 'Absolutely! You can upgrade or downgrade your plan at any time.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all paid plans come with a 7-day free trial period.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
