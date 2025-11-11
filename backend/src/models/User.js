import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/sinefix/image/upload/v1/defaults/avatar.png',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    country: {
      type: String,
    },
    language: {
      type: String,
      default: 'tr',
      enum: ['tr', 'en', 'de', 'fr', 'es'],
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    subscription: {
      type: {
        type: String,
        enum: ['free', 'basic', 'premium', 'family'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'trial'],
        default: 'active',
      },
      startDate: Date,
      endDate: Date,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },
    profiles: [
      {
        name: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
          default: 'https://res.cloudinary.com/sinefix/image/upload/v1/defaults/profile.png',
        },
        isKids: {
          type: Boolean,
          default: false,
        },
        ageRating: {
          type: String,
          enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'ALL'],
          default: 'ALL',
        },
        preferences: {
          autoplay: { type: Boolean, default: true },
          quality: { type: String, default: 'auto' },
          subtitles: { type: Boolean, default: false },
          language: { type: String, default: 'tr' },
        },
      },
    ],
    settings: {
      theme: {
        type: String,
        enum: ['dark', 'light', 'auto'],
        default: 'dark',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        newReleases: { type: Boolean, default: true },
        recommendations: { type: Boolean, default: true },
        social: { type: Boolean, default: true },
      },
      privacy: {
        showWatchHistory: { type: Boolean, default: true },
        showFavorites: { type: Boolean, default: true },
        allowFollow: { type: Boolean, default: true },
        activityVisible: { type: Boolean, default: true },
      },
      playback: {
        autoplay: { type: Boolean, default: true },
        skipIntro: { type: Boolean, default: true },
        quality: { type: String, default: 'auto' },
        subtitles: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'twitter'],
      default: 'local',
    },
    googleId: String,
    facebookId: String,
    twitterId: String,
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for followers count
userSchema.virtual('followersCount').get(function () {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function () {
  return this.following ? this.following.length : 0;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  const isLocked = this.loginAttempts + 1 >= 5 && !this.isLocked;
  if (isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model('User', userSchema);

export default User;
