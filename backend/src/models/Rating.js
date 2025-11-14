import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentType: {
    type: String,
    enum: ['movie', 'series', 'episode', 'person'],
    required: true,
  },
  contentId: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  categories: {
    story: { type: Number, min: 0, max: 10 },
    acting: { type: Number, min: 0, max: 10 },
    cinematography: { type: Number, min: 0, max: 10 },
    music: { type: Number, min: 0, max: 10 },
    effects: { type: Number, min: 0, max: 10 },
  },
  reviewText: String,
  pros: [String],
  cons: [String],
  spoiler: {
    type: Boolean,
    default: false,
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    value: {
      type: Number,
      enum: [-1, 1],
    },
  }],
  helpfulCount: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

ratingSchema.index({ user: 1, contentType: 1, contentId: 1 }, { unique: true });
ratingSchema.index({ contentType: 1, contentId: 1 });
ratingSchema.index({ rating: -1 });
ratingSchema.index({ helpfulCount: -1 });

export default mongoose.model('Rating', ratingSchema);
