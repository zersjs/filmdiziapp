import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import stripe from 'stripe';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Get user subscription
export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' });
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all subscriptions (admin)
export const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan } = req.query;
    const query = {};
    if (status) query.status = status;
    if (plan) query.plan = plan;

    const subscriptions = await Subscription.find(query)
      .populate('user', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Subscription.countDocuments(query);

    res.json({
      success: true,
      data: subscriptions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create subscription
export const createSubscription = async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethodId } = req.body;

    // Price mapping
    const pricing = {
      basic: { monthly: 9.99, quarterly: 24.99, yearly: 89.99 },
      premium: { monthly: 14.99, quarterly: 39.99, yearly: 139.99 },
      ultra: { monthly: 19.99, quarterly: 49.99, yearly: 179.99 },
    };

    const price = pricing[plan]?.[billingCycle];
    if (!price) {
      return res.status(400).json({ success: false, message: 'Invalid plan or billing cycle' });
    }

    // Create Stripe customer
    const customer = await stripeClient.customers.create({
      email: req.user.email,
      name: req.user.username,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create Stripe subscription
    const stripeSubscription = await stripeClient.subscriptions.create({
      customer: customer.id,
      items: [{ price: price }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Calculate end date
    const endDate = new Date();
    if (billingCycle === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else if (billingCycle === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
    else if (billingCycle === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);

    // Create subscription in database
    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      price,
      billingCycle,
      endDate,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: customer.id,
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Active subscription not found' });
    }

    await subscription.cancel();

    // Cancel Stripe subscription
    if (subscription.stripeSubscriptionId) {
      await stripeClient.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Renew subscription
export const renewSubscription = async (req, res) => {
  try {
    const { months = 1 } = req.body;
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await subscription.renew(months);
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subscription stats (admin)
export const getSubscriptionStats = async (req, res) => {
  try {
    const stats = {
      total: await Subscription.countDocuments(),
      active: await Subscription.countDocuments({ status: 'active' }),
      cancelled: await Subscription.countDocuments({ status: 'cancelled' }),
      expired: await Subscription.countDocuments({ status: 'expired' }),
      byPlan: {
        free: await Subscription.countDocuments({ plan: 'free' }),
        basic: await Subscription.countDocuments({ plan: 'basic' }),
        premium: await Subscription.countDocuments({ plan: 'premium' }),
        ultra: await Subscription.countDocuments({ plan: 'ultra' }),
      },
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
