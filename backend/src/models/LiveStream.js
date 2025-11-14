import mongoose from 'mongoose';

const liveStreamSchema = new mongoose.Schema({
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  thumbnail: String,
  streamType: {
    type: String,
    enum: ['watch_party', 'discussion', 'review', 'podcast', 'gameplay', 'other'],
    required: true,
  },
  relatedContent: {
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode'],
    },
    contentId: Number,
    contentTitle: String,
  },
  streamUrl: String,
  streamKey: String,
  rtmpUrl: String,
  hlsUrl: String,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
  },
  scheduledStartTime: Date,
  actualStartTime: Date,
  endTime: Date,
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: Date,
  }],
  currentViewers: {
    type: Number,
    default: 0,
  },
  peakViewers: {
    type: Number,
    default: 0,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  }],
  settings: {
    allowChat: {
      type: Boolean,
      default: true,
    },
    chatMode: {
      type: String,
      enum: ['everyone', 'followers', 'subscribers'],
      default: 'everyone',
    },
    recordStream: {
      type: Boolean,
      default: false,
    },
  },
  recording: {
    isRecorded: {
      type: Boolean,
      default: false,
    },
    recordingUrl: String,
    duration: Number,
  },
  tags: [String],
  category: String,
}, {
  timestamps: true,
});

liveStreamSchema.index({ streamer: 1, status: 1 });
liveStreamSchema.index({ status: 1, currentViewers: -1 });
liveStreamSchema.index({ scheduledStartTime: 1 });

export default mongoose.model('LiveStream', liveStreamSchema);
