import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'watch',
        'rate',
        'review',
        'favorite',
        'watchlist_add',
        'collection_create',
        'collection_update',
        'follow',
        'comment',
      ],
      required: true,
    },
    contentId: Number,
    contentType: {
      type: String,
      enum: ['movie', 'tv', 'user', 'collection', 'review'],
    },
    rating: Number,
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ contentId: 1, contentType: 1 });
activitySchema.index({ createdAt: -1 });

// Static method to create activity
activitySchema.statics.createActivity = async function (data) {
  try {
    const activity = await this.create(data);
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

// Static method to get user feed
activitySchema.statics.getUserFeed = async function (userId, following, options = {}) {
  const { limit = 20, skip = 0 } = options;

  const activities = await this.find({
    user: { $in: [userId, ...following] },
    isPublic: true,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName avatar')
    .populate('targetUserId', 'username fullName avatar')
    .populate('reviewId')
    .populate('collectionId', 'name description itemsCount');

  return activities;
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
