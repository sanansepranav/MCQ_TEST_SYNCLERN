const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testType: {
      type: String,
      enum: ['mcq', 'coding', 'combined'],
      default: 'mcq',
    },
    codingMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 attempt is required'],
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
      min: [0, 'Marks per question cannot be negative'],
    },
    negativeMarks: {
      type: Number,
      default: 0.25,
      min: [0, 'Negative marks cannot be negative'],
    },
    passingPercentage: {
      type: Number,
      default: 40,
      min: [0, 'Passing percentage cannot be negative'],
      max: [100, 'Passing percentage cannot exceed 100'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    accessCode: {
      type: String,
      default: '',
    },
    allowedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    settings: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      showResults: { type: Boolean, default: true },
      allowReview: { type: Boolean, default: true },
      autoSubmit: { type: Boolean, default: true },
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: populate questions from the Question model
testSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'testId',
});

// Virtual: populate answer key from AnswerKey model
testSchema.virtual('answerKey', {
  ref: 'AnswerKey',
  localField: '_id',
  foreignField: 'testId',
  justOne: true,
});

// Indexes
testSchema.index({ createdBy: 1, status: 1 });
testSchema.index({ subject: 1 });
testSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('Test', testSchema);
