import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  progress: {
    current: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      required: true,
    },
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
  unlockedAt: Date,
  displayOnProfile: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

achievementSchema.index({ user: 1, badge: 1 }, { unique: true });
achievementSchema.index({ user: 1, isUnlocked: 1 });

export default mongoose.model('Achievement', achievementSchema);
