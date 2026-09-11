const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test ID is required'],
    },
    questionNo: {
      type: Number,
      required: [true, 'Question number is required'],
      min: [1, 'Question number must be at least 1'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    optionA: {
      type: String,
      required: [true, 'Option A is required'],
      trim: true,
    },
    optionB: {
      type: String,
      required: [true, 'Option B is required'],
      trim: true,
    },
    optionC: {
      type: String,
      required: [true, 'Option C is required'],
      trim: true,
    },
    optionD: {
      type: String,
      required: [true, 'Option D is required'],
      trim: true,
    },
    optionE: {
      type: String,
      trim: true,
      default: '',
    },
    marks: {
      type: Number,
      default: 1,
      min: [0, 'Marks cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Each question number must be unique within a test
questionSchema.index({ testId: 1, questionNo: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);
