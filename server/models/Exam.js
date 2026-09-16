import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      trim: true,
      sparse: true
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      default: '00:00'
    },
    endTime: {
      type: String,
      default: '23:59'
    },
    duration: {
      type: Number,
      default: 20,
      required: true
    },
    questions: [
      {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Question'
      }
    ],
    selectionMode: {
      type: String,
      enum: ['auto', 'custom', 'hybrid'],
      default: 'custom'
    },
    subjectDistribution: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    manualQuestionIds: [
      {
        type: mongoose.Schema.Types.Mixed
      }
    ],
    marksPerQuestion: {
      type: Number,
      default: 1
    },
    negativeMarks: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 20
    },
    passingPercentage: {
      type: Number,
      default: 50
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft'
    },
    leaderboardEnabled: {
      type: Boolean,
      default: true
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeOptions: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: String,
      default: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
export default Exam;
