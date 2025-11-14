import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  coverImage: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['movie', 'series', 'actor', 'director', 'trivia', 'quotes', 'mixed'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium',
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'text'],
      default: 'multiple_choice',
    },
    options: [String],
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: String,
    imageUrl: String,
    points: {
      type: Number,
      default: 10,
    },
    timeLimit: {
      type: Number,
      default: 30,
    },
  }],
  totalQuestions: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  timeLimit: {
    type: Number,
    default: 600,
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeTaken: Number,
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalAttempts: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
}, {
  timestamps: true,
});

quizSchema.index({ createdBy: 1 });
quizSchema.index({ category: 1, isPublished: 1 });
quizSchema.index({ featured: 1, averageScore: -1 });

export default mongoose.model('Quiz', quizSchema);
