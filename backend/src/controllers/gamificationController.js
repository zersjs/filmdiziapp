import Badge from '../models/Badge.js';
import Achievement from '../models/Achievement.js';
import Leaderboard from '../models/Leaderboard.js';
import Streak from '../models/Streak.js';
import CoinTransaction from '../models/CoinTransaction.js';

// Get all badges
export const getAllBadges = async (req, res) => {
  try {
    const { category, rarity, isActive } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const badges = await Badge.find(query).sort({ rarity: 1, points: -1 });
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user achievements
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await Achievement.find({ user: userId })
      .populate('badge')
      .sort({ isUnlocked: -1, createdAt: -1 });

    const stats = {
      total: achievements.length,
      unlocked: achievements.filter(a => a.isUnlocked).length,
      inProgress: achievements.filter(a => !a.isUnlocked).length,
    };

    res.json({ success: true, data: achievements, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update achievement progress
export const updateAchievementProgress = async (req, res) => {
  try {
    const { badgeId, progress } = req.body;

    let achievement = await Achievement.findOne({
      user: req.user._id,
      badge: badgeId,
    });

    if (!achievement) {
      const badge = await Badge.findById(badgeId);
      if (!badge) {
        return res.status(404).json({ success: false, message: 'Badge not found' });
      }

      achievement = await Achievement.create({
        user: req.user._id,
        badge: badgeId,
        progress: { current: progress, target: badge.criteria.target },
      });
    } else {
      achievement.progress.current = progress;
    }

    if (achievement.progress.current >= achievement.progress.target && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();

      // Add badge to badge holders
      const badge = await Badge.findById(badgeId);
      badge.holders.push({ user: req.user._id });
      badge.totalHolders += 1;
      await badge.save();

      // Award points to leaderboard
      await updateLeaderboardPoints(req.user._id, badge.points);
    }

    await achievement.save();
    res.json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, timeframe = 'all' } = req.query;

    let query = {};
    if (timeframe === 'monthly') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      // Would need to implement monthly leaderboard logic
    }

    const leaderboard = await Leaderboard.find(query)
      .populate('user', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ totalPoints: -1 });

    // Update ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = (page - 1) * limit + index + 1;
    });

    await Promise.all(leaderboard.map(entry => entry.save()));

    const count = await Leaderboard.countDocuments(query);

    res.json({
      success: true,
      data: leaderboard,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user leaderboard entry
export const getUserLeaderboard = async (req, res) => {
  try {
    const { userId } = req.params;
    let leaderboard = await Leaderboard.findOne({ user: userId }).populate('user', 'username avatar');

    if (!leaderboard) {
      leaderboard = await Leaderboard.create({ user: userId });
      await leaderboard.populate('user', 'username avatar');
    }

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update streak
export const updateStreak = async (req, res) => {
  try {
    const { streakType } = req.body;

    let streak = await Streak.findOne({ user: req.user._id, streakType });

    if (!streak) {
      streak = await Streak.create({
        user: req.user._id,
        streakType,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      });
    } else {
      const lastActivity = new Date(streak.lastActivityDate);
      const today = new Date();
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else if (daysDiff > 1) {
        streak.currentStreak = 1;
      }

      streak.lastActivityDate = today;
      streak.history.push({ date: today, count: 1 });

      await streak.save();
    }

    res.json({ success: true, data: streak });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user streak
export const getUserStreak = async (req, res) => {
  try {
    const { userId } = req.params;
    const streaks = await Streak.find({ user: userId });
    res.json({ success: true, data: streaks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get coin transactions
export const getCoinTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;

    const transactions = await CoinTransaction.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await CoinTransaction.countDocuments(query);
    const balance = transactions[0]?.balanceAfter || 0;

    res.json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      balance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Award coins
export const awardCoins = async (req, res) => {
  try {
    const { amount, reason, description } = req.body;

    const lastTransaction = await CoinTransaction.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const currentBalance = lastTransaction?.balanceAfter || 0;

    const transaction = await CoinTransaction.create({
      user: req.user._id,
      type: 'earn',
      amount,
      balanceAfter: currentBalance + amount,
      reason,
      description,
    });

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function
async function updateLeaderboardPoints(userId, points) {
  let leaderboard = await Leaderboard.findOne({ user: userId });

  if (!leaderboard) {
    leaderboard = await Leaderboard.create({ user: userId, totalPoints: points });
  } else {
    leaderboard.totalPoints += points;
    leaderboard.level = Math.floor(leaderboard.totalPoints / 1000) + 1;
    await leaderboard.save();
  }
}
