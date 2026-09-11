const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseIndex: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  actualOutput: {
    type: String,
    default: '',
  },
  executionTime: {
    type: Number, // milliseconds
    default: 0,
  },
  memoryUsed: {
    type: Number, // KB
    default: 0,
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
    default: 'Pending',
  },
});

const codingSubmissionSchema = new mongoose.Schema(
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
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingProblem',
      required: true,
    },
    language: {
      type: String,
      enum: ['c', 'python', 'java'],
      required: [true, 'Language is required'],
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
    },
    testCaseResults: [testCaseResultSchema],
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'error'],
      default: 'pending',
    },
    compilationError: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    mcqResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Result',
      default: null
    },
    autoSubmitted: {
      type: Boolean,
      default: false
    },
    violations: [{
      type: { type: String },
      timestamp: { type: Date }
    }]
  },
  {
    timestamps: true,
  }
);

// Index: find submissions by student + test efficiently
codingSubmissionSchema.index({ testId: 1, studentId: 1 });
codingSubmissionSchema.index({ problemId: 1, studentId: 1 });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
