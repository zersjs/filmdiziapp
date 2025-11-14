import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video', 'link', 'poll', 'review'],
    default: 'text',
  },
  title: String,
  content: {
    type: String,
    required: true,
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
    },
    url: String,
    thumbnail: String,
  }],
  relatedContent: {
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode', 'person'],
    },
    contentId: Number,
    contentTitle: String,
  },
  tags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  sharesCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  spoiler: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ likesCount: -1, createdAt: -1 });

export default mongoose.model('Post', postSchema);
