import mongoose from 'mongoose';

const giftSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  giftType: {
    type: String,
    enum: ['subscription', 'badge', 'coins', 'custom'],
    required: true,
  },
  giftItem: {
    type: {
      type: String,
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    value: Number,
    icon: String,
  },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'delivered', 'claimed', 'expired', 'cancelled'],
    default: 'pending',
  },
  deliveredAt: Date,
  claimedAt: Date,
  expiresAt: Date,
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  occasion: {
    type: String,
    enum: ['birthday', 'holiday', 'achievement', 'thank_you', 'just_because', 'other'],
  },
}, {
  timestamps: true,
});

giftSchema.index({ recipient: 1, status: 1 });
giftSchema.index({ sender: 1 });
giftSchema.index({ expiresAt: 1 });

export default mongoose.model('Gift', giftSchema);
