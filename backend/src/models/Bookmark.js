import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemType: {
    type: String,
    enum: ['post', 'review', 'forum_post', 'comment', 'article', 'list'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  category: {
    type: String,
    enum: ['favorites', 'read_later', 'inspiration', 'reference', 'custom'],
    default: 'favorites',
  },
  customCategory: String,
  note: String,
  tags: [String],
}, {
  timestamps: true,
});

bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, category: 1 });

export default mongoose.model('Bookmark', bookmarkSchema);
