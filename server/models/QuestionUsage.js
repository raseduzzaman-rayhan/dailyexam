import mongoose from 'mongoose';

const QuestionUsageSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true
    },
    examTitle: {
      type: String,
      trim: true,
      default: ''
    },
    examStatus: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
      index: true
    },
    examDate: {
      type: String,
      default: ''
    },
    usedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate usage entries for the same question in the same exam
QuestionUsageSchema.index({ questionId: 1, examId: 1 }, { unique: true });

const QuestionUsage = mongoose.models.QuestionUsage || mongoose.model('QuestionUsage', QuestionUsageSchema);
export default QuestionUsage;
