import mongoose from 'mongoose';

const watchPartySchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: {
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode'],
      required: true,
    },
    contentId: {
      type: Number,
      required: true,
    },
    title: String,
    posterPath: String,
    runtime: Number,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  timezone: String,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
  },
  roomId: {
    type: String,
    unique: true,
    sparse: true,
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'friends_only'],
    default: 'public',
  },
  maxParticipants: {
    type: Number,
    default: 50,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: Date,
    status: {
      type: String,
      enum: ['joined', 'left', 'kicked'],
      default: 'joined',
    },
  }],
  participantsCount: {
    type: Number,
    default: 0,
  },
  invites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  playbackState: {
    currentTime: {
      type: Number,
      default: 0,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    lastUpdated: Date,
  },
  settings: {
    allowChat: {
      type: Boolean,
      default: true,
    },
    allowReactions: {
      type: Boolean,
      default: true,
    },
    syncPlayback: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

watchPartySchema.index({ host: 1, status: 1 });
watchPartySchema.index({ scheduledTime: 1, status: 1 });
watchPartySchema.index({ privacy: 1, status: 1 });

export default mongoose.model('WatchParty', watchPartySchema);
