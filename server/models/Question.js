import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'সাধারণ',
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    questionText: {
      type: String,
      trim: true
    },
    question: {
      type: String,
      trim: true
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    correctAnswer: {
      type: String,
      trim: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed
    },
    explanation: {
      type: String,
      default: ''
    },
    marks: {
      type: Number,
      default: 1
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export default Question;
