import express from 'express';
import {
  getAllBadges,
  getUserAchievements,
  updateAchievementProgress,
  getLeaderboard,
  getUserLeaderboard,
  updateStreak,
  getUserStreak,
  getCoinTransactions,
  awardCoins,
} from '../controllers/gamificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/badges', getAllBadges);
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/:userId', getUserLeaderboard);

router.use(protect);

// Achievements
router.get('/achievements/:userId', getUserAchievements);
router.post('/achievements/progress', updateAchievementProgress);

// Streaks
router.post('/streaks', updateStreak);
router.get('/streaks/:userId', getUserStreak);

// Coins
router.get('/coins', getCoinTransactions);
router.post('/coins/award', awardCoins);

export default router;
