import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  coverImage: String,
  eventType: {
    type: String,
    enum: ['watch_party', 'premiere', 'discussion', 'contest', 'meetup', 'virtual', 'live_stream'],
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  relatedContent: {
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode'],
    },
    contentId: Number,
    contentTitle: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  timezone: String,
  location: {
    type: {
      type: String,
      enum: ['online', 'physical', 'hybrid'],
      default: 'online',
    },
    venue: String,
    address: String,
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    streamUrl: String,
  },
  capacity: Number,
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not_going'],
      default: 'going',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  attendeesCount: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ eventType: 1, isPublic: 1 });
eventSchema.index({ organizer: 1 });

export default mongoose.model('Event', eventSchema);
