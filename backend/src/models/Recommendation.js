import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentType: {
    type: String,
    enum: ['movie', 'series'],
    required: true,
  },
  contentId: {
    type: Number,
    required: true,
  },
  title: String,
  posterPath: String,
  score: {
    type: Number,
    default: 0,
  },
  reasons: [{
    type: String,
    enum: [
      'similar_genre',
      'same_director',
      'same_actor',
      'popular',
      'trending',
      'highly_rated',
      'based_on_history',
      'friend_watched',
      'ai_suggested',
    ],
  }],
  matchPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  basedOn: [{
    contentType: String,
    contentId: Number,
    title: String,
  }],
  isViewed: {
    type: Boolean,
    default: false,
  },
  viewedAt: Date,
  userAction: {
    type: String,
    enum: ['watched', 'added_to_watchlist', 'dismissed', 'liked', 'disliked'],
  },
  actionedAt: Date,
}, {
  timestamps: true,
});

recommendationSchema.index({ user: 1, isViewed: 1 });
recommendationSchema.index({ user: 1, score: -1 });
recommendationSchema.index({ createdAt: -1 });

export default mongoose.model('Recommendation', recommendationSchema);
