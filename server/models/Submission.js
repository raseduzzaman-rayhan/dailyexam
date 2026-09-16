import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true
    },
    selectedOption: {
      type: String,
      default: ''
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const SubmissionSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      sparse: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      sparse: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    examSlug: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    answers: [AnswerSchema],
    totalQuestions: {
      type: Number,
      required: true
    },
    correctCount: {
      type: Number,
      required: true
    },
    wrongCount: {
      type: Number,
      required: true
    },
    unansweredCount: {
      type: Number,
      required: true
    },
    skipped: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      default: false
    },
    startedAt: {
      type: Date,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    tabSwitchCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

SubmissionSchema.index({ examId: 1, whatsappNumber: 1 }, { unique: true });

const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
export default Submission;
