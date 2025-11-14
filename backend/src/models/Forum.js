import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['general', 'movies', 'series', 'actors', 'reviews', 'recommendations', 'technical'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
  }],
  postsCount: {
    type: Number,
    default: 0,
  },
  lastPost: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: Date,
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: [String],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

forumSchema.index({ category: 1, isPinned: -1, createdAt: -1 });
forumSchema.index({ tags: 1 });

export default mongoose.model('Forum', forumSchema);
