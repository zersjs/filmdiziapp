import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  coverImage: String,
  items: [{
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode'],
      required: true,
    },
    contentId: {
      type: Number,
      required: true,
    },
    title: String,
    posterPath: String,
    addedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
  totalItems: {
    type: Number,
    default: 0,
  },
  totalDuration: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  collaborative: {
    type: Boolean,
    default: false,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  followersCount: {
    type: Number,
    default: 0,
  },
  tags: [String],
  category: {
    type: String,
    enum: ['favorites', 'watchlist', 'watched', 'custom'],
    default: 'custom',
  },
}, {
  timestamps: true,
});

playlistSchema.index({ user: 1 });
playlistSchema.index({ isPublic: 1, followersCount: -1 });
playlistSchema.index({ tags: 1 });

export default mongoose.model('Playlist', playlistSchema);
