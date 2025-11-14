import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentType: {
    type: String,
    enum: ['movie', 'series', 'episode', 'post', 'review', 'playlist', 'profile'],
    required: true,
  },
  contentId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  platform: {
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'whatsapp', 'telegram', 'email', 'link', 'internal'],
    required: true,
  },
  message: String,
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  shareUrl: String,
}, {
  timestamps: true,
});

shareSchema.index({ user: 1, createdAt: -1 });
shareSchema.index({ contentType: 1, contentId: 1 });

export default mongoose.model('Share', shareSchema);
