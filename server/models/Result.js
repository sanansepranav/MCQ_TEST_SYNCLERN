const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionNo: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: String, // 'A', 'B', 'C', 'D', 'E' or empty string if unanswered
    enum: ['A', 'B', 'C', 'D', 'E', ''],
    default: '',
  },
});

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    answers: [answerSchema],
    correctAnswers: {
      type: Number,
      default: 0
    },
    incorrectAnswers: {
      type: Number,
      default: 0
    },
    unattempted: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'graded', 'reviewed'],
      default: 'in-progress',
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
    violations: [violationSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index: one result per student per test per attempt
resultSchema.index({ testId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
resultSchema.index({ studentId: 1, status: 1 });

// Calculate percentage before saving
resultSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100 * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
