const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test ID is required'],
    },
    violationType: {
      type: String,
      required: [true, 'Violation type is required'],
      enum: [
        'tab-switch',
        'window-blur',
        'copy-paste',
        'right-click',
        'fullscreen-exit',
        'devtools-open',
        'multiple-monitors',
        'other',
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    description: {
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

// Indexes for fast queries
violationSchema.index({ studentId: 1, testId: 1 });
violationSchema.index({ testId: 1 });

module.exports = mongoose.model('Violation', violationSchema);
