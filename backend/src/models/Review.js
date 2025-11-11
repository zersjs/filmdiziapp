import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentId: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'tv'],
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [0.5, 'Rating must be at least 0.5'],
      max: [10, 'Rating cannot exceed 10'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [5000, 'Review cannot exceed 5000 characters'],
    },
    spoiler: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReasons: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });
reviewSchema.index({ contentId: 1, contentType: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for likes count
reviewSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for dislikes count
reviewSchema.virtual('dislikesCount').get(function () {
  return this.dislikes ? this.dislikes.length : 0;
});

// Virtual for replies count
reviewSchema.virtual('repliesCount').get(function () {
  return this.replies ? this.replies.length : 0;
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
