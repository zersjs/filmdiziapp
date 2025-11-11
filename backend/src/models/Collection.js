import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Collection name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    coverImage: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    items: [
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
        note: {
          type: String,
          maxlength: 500,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [String],
    category: {
      type: String,
      enum: ['favorites', 'watchlist', 'watched', 'custom'],
      default: 'custom',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
collectionSchema.index({ user: 1 });
collectionSchema.index({ name: 1 });
collectionSchema.index({ isPublic: 1 });
collectionSchema.index({ tags: 1 });
collectionSchema.index({ createdAt: -1 });

// Virtual for items count
collectionSchema.virtual('itemsCount').get(function () {
  return this.items ? this.items.length : 0;
});

// Virtual for followers count
collectionSchema.virtual('followersCount').get(function () {
  return this.followers ? this.followers.length : 0;
});

// Methods
collectionSchema.methods.addItem = function (contentId, contentType, note) {
  const exists = this.items.some(
    (item) => item.contentId === contentId && item.contentType === contentType
  );

  if (!exists) {
    this.items.push({ contentId, contentType, note });
  }

  return this.save();
};

collectionSchema.methods.removeItem = function (contentId, contentType) {
  this.items = this.items.filter(
    (item) => !(item.contentId === contentId && item.contentType === contentType)
  );

  return this.save();
};

collectionSchema.methods.addFollower = function (userId) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
  }

  return this.save();
};

collectionSchema.methods.removeFollower = function (userId) {
  this.followers = this.followers.filter((id) => !id.equals(userId));

  return this.save();
};

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
