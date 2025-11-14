import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['watching', 'rating', 'social', 'achievement', 'special', 'seasonal'],
    required: true,
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'streak', 'special', 'time_based', 'level'],
      required: true,
    },
    target: Number,
    metric: String,
  },
  points: {
    type: Number,
    default: 10,
  },
  color: String,
  unlockMessage: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  isSecret: {
    type: Boolean,
    default: false,
  },
  holders: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalHolders: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ totalHolders: -1 });

export default mongoose.model('Badge', badgeSchema);
