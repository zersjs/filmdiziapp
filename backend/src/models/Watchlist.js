import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema(
  {
    contentId: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'tv'],
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const watchHistoryItemSchema = new mongoose.Schema(
  {
    contentId: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'tv'],
      required: true,
    },
    season: Number,
    episode: Number,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    duration: Number, // in seconds
    lastWatched: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    favorites: [watchlistItemSchema],
    watchLater: [watchlistItemSchema],
    watchHistory: [watchHistoryItemSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
watchlistSchema.index({ user: 1 });
watchlistSchema.index({ 'favorites.contentId': 1 });
watchlistSchema.index({ 'watchLater.contentId': 1 });
watchlistSchema.index({ 'watchHistory.contentId': 1 });
watchlistSchema.index({ 'watchHistory.lastWatched': -1 });

// Methods to add/remove items
watchlistSchema.methods.addToFavorites = function (contentId, contentType) {
  const exists = this.favorites.some(
    (item) => item.contentId === contentId && item.contentType === contentType
  );

  if (!exists) {
    this.favorites.push({ contentId, contentType });
  }

  return this.save();
};

watchlistSchema.methods.removeFromFavorites = function (contentId, contentType) {
  this.favorites = this.favorites.filter(
    (item) => !(item.contentId === contentId && item.contentType === contentType)
  );

  return this.save();
};

watchlistSchema.methods.addToWatchLater = function (contentId, contentType) {
  const exists = this.watchLater.some(
    (item) => item.contentId === contentId && item.contentType === contentType
  );

  if (!exists) {
    this.watchLater.push({ contentId, contentType });
  }

  return this.save();
};

watchlistSchema.methods.removeFromWatchLater = function (contentId, contentType) {
  this.watchLater = this.watchLater.filter(
    (item) => !(item.contentId === contentId && item.contentType === contentType)
  );

  return this.save();
};

watchlistSchema.methods.addToHistory = function (contentId, contentType, options = {}) {
  const { season, episode, progress = 0, duration } = options;

  // Remove existing entry for this content
  this.watchHistory = this.watchHistory.filter(
    (item) => !(item.contentId === contentId && item.contentType === contentType)
  );

  // Add new entry
  this.watchHistory.unshift({
    contentId,
    contentType,
    season,
    episode,
    progress,
    duration,
    lastWatched: new Date(),
  });

  // Keep only last 100 items
  if (this.watchHistory.length > 100) {
    this.watchHistory = this.watchHistory.slice(0, 100);
  }

  return this.save();
};

watchlistSchema.methods.clearHistory = function () {
  this.watchHistory = [];
  return this.save();
};

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;
