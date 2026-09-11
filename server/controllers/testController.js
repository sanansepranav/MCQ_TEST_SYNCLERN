const fs = require('fs');
const Papa = require('papaparse');
const Test = require('../models/Test');
const Question = require('../models/Question');
const AnswerKey = require('../models/AnswerKey');
const Result = require('../models/Result');
const CodingProblem = require('../models/CodingProblem');

/**
 * @desc    Create a new test
 * @route   POST /api/tests
 * @access  Private (admin)
 */
exports.createTest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subject,
      startTime,
      endTime,
      duration,
      maxAttempts,
      negativeMarking,
      marksPerQuestion,
      negativeMarks,
      passingMarks,
      accessCode,
      tags,
      settings,
      testType,
      codingMarks,
    } = req.body;

    const test = await Test.create({
      title,
      description: description || '',
      subject: subject || 'General',
      createdBy: req.user._id,
      startTime,
      endTime,
      duration,
      maxAttempts: maxAttempts || 1,
      negativeMarking: negativeMarking || false,
      marksPerQuestion: marksPerQuestion || 1,
      negativeMarks: negativeMarks || 0,
      passingMarks: passingMarks || 0,
      accessCode: accessCode || '',
      tags: tags || [],
      settings: settings || {},
      testType: testType || 'mcq',
      codingMarks: codingMarks || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tests (admin sees everything)
 * @route   GET /api/tests
 * @access  Private
 */
exports.getTests = async (req, res, next) => {
  try {
    let query = {};

    // Students only see published/active tests
    if (req.user.role === 'student') {
      query.status = { $in: ['published', 'active'] };
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Optional filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.subject) query.subject = { $regex: req.query.subject, $options: 'i' };

    const [tests, total] = await Promise.all([
      Test.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Test.countDocuments(query),
    ]);

    // For each test, get question count
    const testsWithMeta = await Promise.all(
      tests.map(async (t) => {
        const testObj = t.toObject();
        testObj.questionCount = await Question.countDocuments({ testId: t._id });
        const hasAnswerKey = await AnswerKey.exists({ testId: t._id });
        testObj.hasAnswerKey = !!hasAnswerKey;
        return testObj;
      })
    );

    res.json({
      success: true,
      data: testsWithMeta,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single test by ID (with questions for admin)
 * @route   GET /api/tests/:id
 * @access  Private
 */
exports.getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const questions = await Question.find({ testId: test._id }).sort({ questionNo: 1 });
    const testObj = test.toObject();
    testObj.questions = questions;
    testObj.questionCount = questions.length;

    // Admin gets answer key too
    if (req.user.role === 'admin') {
      const answerKey = await AnswerKey.findOne({ testId: test._id });
      testObj.answerKey = answerKey;
    }

    res.json({ success: true, data: testObj });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a test
 * @route   PUT /api/tests/:id
 * @access  Private (admin)
 */
exports.updateTest = async (req, res, next) => {
  try {
    let test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const allowedFields = [
      'title', 'description', 'subject', 'startTime', 'endTime', 'duration',
      'maxAttempts', 'negativeMarking', 'marksPerQuestion', 'negativeMarks',
      'passingMarks', 'status', 'accessCode', 'tags', 'settings', 'testType', 'codingMarks',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    test = await Test.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Test updated', data: test });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a test and all related data
 * @route   DELETE /api/tests/:id
 * @access  Private (admin)
 */
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    await Promise.all([
      Question.deleteMany({ testId: test._id }),
      AnswerKey.deleteOne({ testId: test._id }),
      Result.deleteMany({ testId: test._id }),
      test.deleteOne(),
    ]);

    res.json({ success: true, message: 'Test and all related data deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add questions manually (array of questions)
 * @route   POST /api/tests/:id/questions
 * @access  Private (admin)
 */
exports.addQuestionsManually = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions array is required' });
    }

    // Get current max questionNo
    const lastQuestion = await Question.findOne({ testId: test._id })
      .sort({ questionNo: -1 })
      .select('questionNo');
    let nextNo = lastQuestion ? lastQuestion.questionNo + 1 : 1;

    const docs = questions.map((q) => ({
      testId: test._id,
      questionNo: q.questionNo || nextNo++,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      optionE: q.optionE || '',
      marks: q.marks || test.marksPerQuestion,
    }));

    // Remove existing questions with same numbers to allow overwrite
    const questionNos = docs.map((d) => d.questionNo);
    await Question.deleteMany({ testId: test._id, questionNo: { $in: questionNos } });

    const inserted = await Question.insertMany(docs);

    // Update total marks
    const totalMarks = await Question.aggregate([
      { $match: { testId: test._id } },
      { $group: { _id: null, total: { $sum: '$marks' } } },
    ]);
    test.totalMarks = totalMarks[0]?.total || 0;
    await test.save();

    res.status(201).json({
      success: true,
      message: `${inserted.length} questions added`,
      data: { questions: inserted, totalMarks: test.totalMarks },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload questions via CSV
 * @route   POST /api/tests/:id/questions/csv
 * @access  Private (admin)
 *
 * CSV: questionNo, questionText, optionA, optionB, optionC, optionD, marks
 */
exports.uploadQuestionsCSV = async (req, res, next) => {
  try {
    console.log('CSV upload received');
    console.log('File:', req.file);
    console.log('TestId:', req.params.id);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const Papa = require('papaparse');
    const csvString = req.file.buffer 
      ? req.file.buffer.toString('utf8') 
      : fs.readFileSync(req.file.path, 'utf-8');

    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      transform: (value) => value.trim()
    });

    console.log('Parsed rows:', parsed.data.length);
    console.log('First row:', parsed.data[0]);
    console.log('Fields found:', parsed.meta.fields);

    const requiredFields = [
      'questionText', 'optionA', 
      'optionB', 'optionC', 'optionD'
    ];

    const fields = parsed.meta.fields.map(
      f => f.toLowerCase().trim()
    );

    for (const field of requiredFields) {
      if (!fields.includes(field.toLowerCase())) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Missing required column: ${field}. Required columns: questionNo, questionText, optionA, optionB, optionC, optionD, optionE (optional), marks`
        });
      }
    }

    const questions = parsed.data
      .filter(row => 
        row.questionText && 
        row.questionText.trim() !== ''
      )
      .map((row, index) => {
        // Handle case-insensitive column names
        const getField = (obj, fieldName) => {
          const key = Object.keys(obj).find(
            k => k.toLowerCase().trim() === 
                 fieldName.toLowerCase()
          );
          return key ? obj[key]?.trim() : '';
        };

        return {
          testId: req.params.id,
          questionNo: parseInt(
            getField(row, 'questionno')
          ) || (index + 1),
          questionText: getField(row, 'questiontext'),
          optionA: getField(row, 'optiona'),
          optionB: getField(row, 'optionb'),
          optionC: getField(row, 'optionc'),
          optionD: getField(row, 'optiond'),
          optionE: getField(row, 'optione') || '',
          marks: parseFloat(
            getField(row, 'marks')
          ) || 1
        };
      });

    console.log('Questions to insert:', questions.length);

    if (questions.length === 0) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'No valid questions found in CSV. Check column names match required format.'
      });
    }

    await Question.deleteMany({ testId: req.params.id });
    await Question.insertMany(questions);

    // Update total marks
    test.totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    await test.save();

    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      message: `${questions.length} questions uploaded successfully`,
      count: questions.length
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Upload / replace answer key
 * @route   POST /api/tests/:id/answerkey
 * @access  Private (admin)
 */
exports.uploadAnswerKey = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required: [{questionNo, correctOption}]',
      });
    }

    // Validate options
    const valid = answers.every(
      (a) => a.questionNo && ['A', 'B', 'C', 'D', 'E'].includes(a.correctOption)
    );
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Each answer must have questionNo and correctOption (A/B/C/D/E)',
      });
    }

    const answerKey = await AnswerKey.findOneAndUpdate(
      { testId: test._id },
      { testId: test._id, answers },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Answer key saved successfully',
      data: answerKey,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get answer key for a test (admin only)
 * @route   GET /api/tests/:id/answerkey
 * @access  Private (admin)
 */
exports.getAnswerKey = async (req, res, next) => {
  try {
    const answerKey = await AnswerKey.findOne({ testId: req.params.id });

    if (!answerKey) {
      return res.status(404).json({
        success: false,
        message: 'No answer key found for this test',
      });
    }

    res.json({ success: true, data: answerKey });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get questions for a test
 * @route   GET /api/tests/:id/questions
 * @access  Private
 */
exports.getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ testId: req.params.id }).sort({ questionNo: 1 });
    res.json({ success: true, data: questions, count: questions.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish a test
 * @route   PUT /api/tests/:id/publish
 * @access  Private (admin)
 */
exports.publishTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const testType = test.testType || 'mcq';

    const mcqCount = await Question.countDocuments({ testId: test._id });
    const codingCount = await CodingProblem.countDocuments({ testId: test._id });

    console.log('Publish validation:', {
      testType,
      mcqCount,
      codingCount
    });

    if (testType === 'mcq' && mcqCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish an MCQ test with no questions. Please add questions first.'
      });
    }

    if (testType === 'coding' && codingCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish a Coding test with no coding problems. Please add at least one coding problem first.'
      });
    }

    if (testType === 'combined' && mcqCount === 0 && codingCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish a Combined test with no content. Please add MCQ questions and coding problems.'
      });
    }

    if (testType === 'combined' && mcqCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Combined test is missing MCQ questions. Please add questions to the MCQ section.'
      });
    }

    if (testType === 'combined' && codingCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Combined test is missing coding problems. Please add at least one coding problem.'
      });
    }

    if (testType === 'mcq' || testType === 'combined') {
      const answerKey = await AnswerKey.findOne({ testId: test._id });
      if (!answerKey) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish a test without an answer key',
        });
      }
    }

    test.status = 'published';
    if (testType === 'mcq') {
      test.totalMarks = mcqCount * test.marksPerQuestion;
    } else if (testType === 'combined') {
      // Just keep existing logic or add codingMarks if available, but to be safe:
      test.totalMarks = (mcqCount * test.marksPerQuestion) + (test.codingMarks || 0);
    } else {
      test.totalMarks = test.codingMarks || 0;
    }
    await test.save();

    res.json({ success: true, message: 'Test published', data: test });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/tests/stats/dashboard
 * @access  Private (admin)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const now = new Date();

    const [totalTests, totalStudents, totalSubmissions, liveTests, recentTests] =
      await Promise.all([
        Test.countDocuments(),
        User.countDocuments({ role: 'student' }),
        Result.countDocuments(),
        Test.countDocuments({
          status: { $in: ['published', 'active'] },
          startTime: { $lte: now },
          endTime: { $gte: now },
        }),
        Test.find()
          .populate('createdBy', 'name')
          .sort({ createdAt: -1 })
          .limit(10)
          .select('title status createdAt startTime endTime'),
      ]);

    // Recent submissions
    const recentSubmissions = await Result.find()
      .populate('studentId', 'name rollNumber')
      .populate('testId', 'title')
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('score percentage submittedAt autoSubmitted');

    res.json({
      success: true,
      data: {
        totalTests,
        totalStudents,
        totalSubmissions,
        liveTests,
        recentTests,
        recentSubmissions,
      },
    });
  } catch (error) {
    next(error);
  }
};
