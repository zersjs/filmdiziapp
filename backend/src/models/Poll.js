import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['movie', 'series', 'actor', 'general', 'trivia', 'prediction'],
    default: 'general',
  },
  options: [{
    text: {
      type: String,
      required: true,
    },
    imageUrl: String,
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    voteCount: {
      type: Number,
      default: 0,
    },
  }],
  totalVotes: {
    type: Number,
    default: 0,
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false,
  },
  allowNewOptions: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  featured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
}, {
  timestamps: true,
});

pollSchema.index({ createdBy: 1 });
pollSchema.index({ category: 1, isActive: 1 });
pollSchema.index({ featured: 1, startDate: -1 });

export default mongoose.model('Poll', pollSchema);
