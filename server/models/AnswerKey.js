const mongoose = require('mongoose');

const answerEntrySchema = new mongoose.Schema({
  questionNo: {
    type: Number,
    required: [true, 'Question number is required'],
  },
  correctOption: {
    type: String,
    required: [true, 'Correct option is required'],
    enum: ['A', 'B', 'C', 'D', 'E'],
  },
});

const answerKeySchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test ID is required'],
      unique: true, // One answer key per test
    },
    answers: {
      type: [answerEntrySchema],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'Answer key must have at least one answer',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// testId index is already created via unique: true on the field definition

module.exports = mongoose.model('AnswerKey', answerKeySchema);
