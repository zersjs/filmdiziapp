import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    metrics: {
      // User metrics
      totalUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      premiumUsers: { type: Number, default: 0 },

      // Engagement metrics
      totalViews: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 }, // in minutes
      avgWatchTime: { type: Number, default: 0 },
      uniqueViewers: { type: Number, default: 0 },

      // Content metrics
      moviesWatched: { type: Number, default: 0 },
      seriesWatched: { type: Number, default: 0 },
      episodesWatched: { type: Number, default: 0 },

      // Social metrics
      totalReviews: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      newFollows: { type: Number, default: 0 },

      // Revenue metrics
      revenue: { type: Number, default: 0 },
      newSubscriptions: { type: Number, default: 0 },
      cancelledSubscriptions: { type: Number, default: 0 },
      churnRate: { type: Number, default: 0 },
    },
    topContent: [
      {
        contentId: Number,
        contentType: String,
        views: Number,
        rating: Number,
      },
    ],
    topUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        watchTime: Number,
        reviews: Number,
      },
    ],
    deviceStats: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      tv: { type: Number, default: 0 },
    },
    geographicStats: [
      {
        country: String,
        users: Number,
        views: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
analyticsSchema.index({ date: -1, type: 1 });
analyticsSchema.index({ 'metrics.totalViews': -1 });

// Static method to record view
analyticsSchema.statics.recordView = async function (contentId, contentType, userId, duration) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let analytics = await this.findOne({ date: today, type: 'daily' });

  if (!analytics) {
    analytics = await this.create({
      date: today,
      type: 'daily',
      metrics: {},
    });
  }

  analytics.metrics.totalViews += 1;
  analytics.metrics.totalWatchTime += Math.floor(duration / 60); // convert to minutes

  if (contentType === 'movie') {
    analytics.metrics.moviesWatched += 1;
  } else {
    analytics.metrics.episodesWatched += 1;
  }

  // Update top content
  const existingContent = analytics.topContent.find(
    (item) => item.contentId === contentId && item.contentType === contentType
  );

  if (existingContent) {
    existingContent.views += 1;
  } else {
    analytics.topContent.push({
      contentId,
      contentType,
      views: 1,
      rating: 0,
    });
  }

  // Sort and keep top 100
  analytics.topContent.sort((a, b) => b.views - a.views);
  analytics.topContent = analytics.topContent.slice(0, 100);

  await analytics.save();
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
