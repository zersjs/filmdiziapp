import mongoose from 'mongoose';

const forumPostSchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
  }],
  repliesCount: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  media: [{
    type: String,
    url: String,
  }],
}, {
  timestamps: true,
});

forumPostSchema.index({ forum: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });

export default mongoose.model('ForumPost', forumPostSchema);
