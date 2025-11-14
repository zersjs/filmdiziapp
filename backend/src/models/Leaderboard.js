import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  rank: {
    type: Number,
    default: 0,
  },
  stats: {
    moviesWatched: {
      type: Number,
      default: 0,
    },
    seriesWatched: {
      type: Number,
      default: 0,
    },
    episodesWatched: {
      type: Number,
      default: 0,
    },
    reviewsWritten: {
      type: Number,
      default: 0,
    },
    commentsPosted: {
      type: Number,
      default: 0,
    },
    badgesEarned: {
      type: Number,
      default: 0,
    },
    postsCreated: {
      type: Number,
      default: 0,
    },
    likesReceived: {
      type: Number,
      default: 0,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
    },
    pollsParticipated: {
      type: Number,
      default: 0,
    },
    eventsAttended: {
      type: Number,
      default: 0,
    },
  },
  monthlyStats: [{
    month: String,
    year: Number,
    points: Number,
    rank: Number,
  }],
  achievements: {
    firstMovie: Date,
    hundredthMovie: Date,
    firstReview: Date,
    hundredthReview: Date,
    firstFollower: Date,
    thousandthFollower: Date,
  },
  streak: {
    current: {
      type: Number,
      default: 0,
    },
    longest: {
      type: Number,
      default: 0,
    },
    lastActivity: Date,
  },
}, {
  timestamps: true,
});

leaderboardSchema.index({ totalPoints: -1 });
leaderboardSchema.index({ rank: 1 });
leaderboardSchema.index({ level: -1 });

export default mongoose.model('Leaderboard', leaderboardSchema);
