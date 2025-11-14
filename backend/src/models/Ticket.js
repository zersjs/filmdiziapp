import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'content', 'account', 'feature_request', 'bug_report', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String,
    attachments: [String],
    isStaff: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  attachments: [String],
  tags: [String],
  resolvedAt: Date,
  closedAt: Date,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
}, {
  timestamps: true,
});

ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ status: 1, priority: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model('Ticket', ticketSchema);
