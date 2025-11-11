import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'support', 'bot'],
      default: 'user',
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachments: [
      {
        url: String,
        type: String,
        name: String,
        size: Number,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
chatMessageSchema.index({ conversation: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['support', 'direct'],
      default: 'support',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    },
    subject: {
      type: String,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ['technical', 'billing', 'content', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage',
    },
    closedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1, status: 1 });
conversationSchema.index({ status: 1, priority: -1, createdAt: -1 });
conversationSchema.index({ assignedTo: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

export { ChatMessage, Conversation };
