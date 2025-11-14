import express from 'express';
import {
  getMySubscription,
  getAllSubscriptions,
  createSubscription,
  cancelSubscription,
  renewSubscription,
  getSubscriptionStats,
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMySubscription);
router.post('/create', createSubscription);
router.post('/cancel', cancelSubscription);
router.post('/renew', renewSubscription);

// Admin routes
router.get('/all', authorize('admin'), getAllSubscriptions);
router.get('/stats', authorize('admin'), getSubscriptionStats);

export default router;
