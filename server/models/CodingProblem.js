const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: '',
  },
  expectedOutput: {
    type: String,
    required: [true, 'Expected output is required'],
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  points: {
    type: Number,
    default: 1,
    min: [0, 'Points cannot be negative'],
  },
});

const codingProblemSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    problemNo: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    inputFormat: {
      type: String,
      default: '',
    },
    outputFormat: {
      type: String,
      default: '',
    },
    constraints: {
      type: String,
      default: '',
    },
    sampleInput: {
      type: String,
      default: '',
    },
    sampleOutput: {
      type: String,
      default: '',
    },
    testCases: [testCaseSchema],
    totalMarks: {
      type: Number,
      default: 10,
      min: [1, 'Total marks must be at least 1'],
    },
    timeLimitMs: {
      type: Number,
      default: 2000, // 2 seconds
      min: [500, 'Time limit must be at least 500ms'],
    },
    memoryLimitKb: {
      type: Number,
      default: 262144, // 256 MB
    },
    allowedLanguages: {
      type: [String],
      default: ['c', 'python', 'java'],
      enum: ['c', 'python', 'java'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique problem number per test
codingProblemSchema.index({ testId: 1, problemNo: 1 }, { unique: true });

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
