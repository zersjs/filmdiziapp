import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  streakType: {
    type: String,
    enum: ['daily_login', 'daily_watch', 'daily_review'],
    default: 'daily_login',
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActivityDate: {
    type: Date,
    default: Date.now,
  },
  history: [{
    date: Date,
    count: Number,
    activities: [String],
  }],
  milestones: [{
    days: Number,
    achievedAt: Date,
    reward: {
      type: String,
      points: Number,
      badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  freezesUsed: {
    type: Number,
    default: 0,
  },
  freezesAvailable: {
    type: Number,
    default: 3,
  },
}, {
  timestamps: true,
});

streakSchema.index({ user: 1, streakType: 1 });
streakSchema.index({ currentStreak: -1 });

export default mongoose.model('Streak', streakSchema);
