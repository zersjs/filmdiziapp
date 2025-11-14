import mongoose from 'mongoose';

const coinTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['earn', 'spend', 'gift', 'purchase', 'refund', 'bonus', 'penalty'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: [
      'daily_login',
      'watch_content',
      'write_review',
      'complete_quiz',
      'achievement',
      'gift_sent',
      'gift_received',
      'subscription_purchase',
      'item_purchase',
      'refund',
      'bonus',
      'admin_adjustment',
      'other',
    ],
    required: true,
  },
  description: String,
  relatedItem: {
    itemType: String,
    itemId: mongoose.Schema.Types.ObjectId,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ type: 1, reason: 1 });

export default mongoose.model('CoinTransaction', coinTransactionSchema);
