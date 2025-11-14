import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  website: String,
  location: {
    city: String,
    country: String,
    timezone: String,
  },
  socialLinks: {
    twitter: String,
    instagram: String,
    facebook: String,
    youtube: String,
    tiktok: String,
    linkedin: String,
  },
  preferences: {
    favoriteGenres: [String],
    favoriteActors: [Number],
    favoriteDirectors: [Number],
    favoriteLanguages: [String],
    favoriteDecade: String,
  },
  watchingHabits: {
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'any'],
    },
    averageSessionLength: Number,
    preferredDevices: [String],
    bingeWatcher: {
      type: Boolean,
      default: false,
    },
  },
  privacy: {
    showWatchHistory: {
      type: Boolean,
      default: true,
    },
    showRatings: {
      type: Boolean,
      default: true,
    },
    showFollowers: {
      type: Boolean,
      default: true,
    },
    allowMessages: {
      type: String,
      enum: ['everyone', 'followers', 'none'],
      default: 'followers',
    },
    showActivity: {
      type: Boolean,
      default: true,
    },
  },
  theme: {
    colorScheme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark',
    },
    accentColor: String,
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
  },
  notifications: {
    email: {
      newFollower: { type: Boolean, default: true },
      newComment: { type: Boolean, default: true },
      newLike: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
    push: {
      newFollower: { type: Boolean, default: true },
      newComment: { type: Boolean, default: true },
      newLike: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      liveStreams: { type: Boolean, default: false },
    },
  },
  badges: [{
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
    },
    displayOnProfile: {
      type: Boolean,
      default: true,
    },
    order: Number,
  }],
  featuredContent: [{
    contentType: String,
    contentId: Number,
    title: String,
    posterPath: String,
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

userProfileSchema.index({ user: 1 });

export default mongoose.model('UserProfile', userProfileSchema);
