import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  coverImage: String,
  avatar: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['movie_club', 'series_fans', 'genre_specific', 'language', 'regional', 'general'],
    required: true,
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public',
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'moderator', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  membersCount: {
    type: Number,
    default: 1,
  },
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    message: String,
  }],
  rules: [String],
  tags: [String],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

groupSchema.index({ category: 1, privacy: 1 });
groupSchema.index({ membersCount: -1 });
groupSchema.index({ tags: 1 });

export default mongoose.model('Group', groupSchema);
