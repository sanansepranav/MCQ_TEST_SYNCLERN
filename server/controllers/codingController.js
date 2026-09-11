const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const Result = require('../models/Result');
const mongoose = require('mongoose');
const Test = require('../models/Test');
const { executeCode } = require('../utils/piston');
const PDFDocument = require('pdfkit');
const Question = require('../models/Question');
const AnswerKey = require('../models/AnswerKey');
const User = require('../models/User');

// ═══════════════════════════════════════════════
//  ADMIN — Problem CRUD
// ═══════════════════════════════════════════════

/**
 * @desc    Create a coding problem for a test
 * @route   POST /api/coding/:testId/problems
 * @access  Private (admin)
 */
exports.createProblem = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log('Creating coding problem for testId:', testId);
    const test = await Test.findById(testId);
    console.log('Test found:', test ? test.title : 'NOT FOUND', 'testType:', test?.testType);

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Auto-increment problem number
    const count = await CodingProblem.countDocuments({ testId });
    const problemNo = count + 1;

    const {
      title, description, inputFormat, outputFormat,
      constraints, sampleInput, sampleOutput, testCases,
      totalMarks, timeLimitMs, memoryLimitKb,
      allowedLanguages, difficulty,
    } = req.body;

    const problem = await CodingProblem.create({
      testId,
      problemNo,
      title,
      description,
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      constraints: constraints || '',
      sampleInput: sampleInput || '',
      sampleOutput: sampleOutput || '',
      testCases: testCases || [],
      totalMarks: totalMarks || 10,
      timeLimitMs: timeLimitMs || 2000,
      memoryLimitKb: memoryLimitKb || 262144,
      allowedLanguages: allowedLanguages || ['c', 'python', 'java'],
      difficulty: difficulty || 'medium',
    });

    console.log(`Coding problem created: ${problem.title} (test: ${testId})`);

    return res.status(201).json({
      success: true,
      message: 'Coding problem created successfully',
      data: problem,
    });
  } catch (error) {
    console.error('Create problem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create problem' });
  }
};

/**
 * @desc    Get all coding problems for a test (admin view — includes hidden test cases)
 * @route   GET /api/coding/:testId/problems
 * @access  Private (admin)
 */
exports.getProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.find({ testId: req.params.testId })
      .sort({ problemNo: 1 });

    return res.json({ success: true, data: problems });
  } catch (error) {
    console.error('Get problems error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch problems' });
  }
};

/**
 * @desc    Update a coding problem
 * @route   PUT /api/coding/problems/:id
 * @access  Private (admin)
 */
exports.updateProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const allowedFields = [
      'title', 'description', 'inputFormat', 'outputFormat',
      'constraints', 'sampleInput', 'sampleOutput', 'testCases',
      'totalMarks', 'timeLimitMs', 'memoryLimitKb',
      'allowedLanguages', 'difficulty',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        problem[field] = req.body[field];
      }
    });

    await problem.save();

    return res.json({
      success: true,
      message: 'Problem updated successfully',
      data: problem,
    });
  } catch (error) {
    console.error('Update problem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update problem' });
  }
};

/**
 * @desc    Delete a coding problem
 * @route   DELETE /api/coding/problems/:id
 * @access  Private (admin)
 */
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const testId = problem.testId;

    // Delete associated submissions
    await CodingSubmission.deleteMany({ problemId: problem._id });

    // Delete the problem
    await problem.deleteOne();

    // Re-number remaining problems
    const remaining = await CodingProblem.find({ testId }).sort({ problemNo: 1 });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].problemNo = i + 1;
      await remaining[i].save();
    }

    return res.json({ success: true, message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete problem' });
  }
};

// ═══════════════════════════════════════════════
//  STUDENT — Problem Access & Code Execution
// ═══════════════════════════════════════════════

/**
 * @desc    Get coding problems for student (hides hidden test cases)
 * @route   GET /api/coding/:testId/student-problems
 * @access  Private (student)
 */
exports.getStudentProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.find({ testId: req.params.testId })
      .sort({ problemNo: 1 });

    // Strip hidden test cases
    const sanitized = problems.map((p) => {
      const obj = p.toObject();
      obj.testCases = obj.testCases.filter((tc) => !tc.isHidden);
      return obj;
    });

    // Get student's best submission per problem
    const submissions = await CodingSubmission.find({
      testId: req.params.testId,
      studentId: req.user._id,
    }).sort({ submittedAt: -1 });

    // Attach latest submission info
    const problemsWithStatus = sanitized.map((p) => {
      const sub = submissions.find(
        (s) => s.problemId.toString() === p._id.toString()
      );
      return {
        ...p,
        lastSubmission: sub
          ? {
              status: sub.status,
              score: sub.score,
              language: sub.language,
              submittedAt: sub.submittedAt,
            }
          : null,
      };
    });

    return res.json({ success: true, data: problemsWithStatus });
  } catch (error) {
    console.error('Get student problems error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch problems' });
  }
};

/**
 * @desc    Run code against sample input (no grading, for practice)
 * @route   POST /api/coding/run
 * @access  Private (student)
 */
exports.runCode = async (req, res) => {
  try {
    const { language, sourceCode, stdin } = req.body;

    console.log('[Run] ' + language + ' code from ' + req.user.email);

    if (!language || !sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Language and code required'
      });
    }

    const result = await executeCode(language, sourceCode, stdin || '');

    console.log('[runCode] Full result:', 
      JSON.stringify(result, null, 2));

    return res.status(200).json({
      success: true,
      output: result.stdout,
      error: result.stderr,
      status: result.status,
      executionTime: result.time,
      memory: result.memory
    });

  } catch (error) {
    console.error('[Run] Error:', error.message);
    
    // Handle specific JDoodle errors 
    // with user-friendly messages:
    if (error.message.includes('daily limit')) {
      return res.status(429).json({
        success: false,
        message: 'Code execution limit reached for today. Please try again tomorrow.'
      });
    }

    if (error.message.includes('credentials')) {
      return res.status(500).json({
        success: false,
        message: 'Code execution service configuration error. Please contact administrator.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Code execution failed. Please try again.',
      error: error.message
    });
  }
};

/**
 * @desc    Submit solution — runs against ALL test cases and grades
 * @route   POST /api/coding/problems/:id/submit
 * @access  Private (student)
 */
exports.submitSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { language, sourceCode } = req.body;

    console.log('[Submit] Starting:', {
      problemId: id,
      language,
      codeLength: sourceCode?.length,
      studentId: req.user._id
    });

    const problem = await CodingProblem.findById(id);
    
    console.log('[Submit] Problem found:', {
      found: !!problem,
      title: problem?.title,
      testCasesCount: problem?.testCases?.length,
      allowedLanguages: problem?.allowedLanguages
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check language is allowed
    const langAllowed = problem.allowedLanguages.includes(language);
    
    console.log('[Submit] Language check:', {
      language,
      allowed: langAllowed,
      allowedLanguages: problem.allowedLanguages
    });

    if (!langAllowed) {
      return res.status(400).json({
        success: false,
        message: language + ' is not allowed for this problem'
      });
    }

    console.log('[Submit] Running', problem.testCases.length, 'test cases');

    const testCaseResults = [];
    let totalScore = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      
      console.log('[Submit] Test case', i + 1, '/', problem.testCases.length);

      let execResult;
      try {
        execResult = await executeCode(
          language,
          sourceCode,
          tc.input || ''
        );
        
        console.log('[Submit] TC' + (i+1) + ' result:', {
          success: execResult.success,
          stdout: execResult.stdout?.substring(0, 50),
          status: execResult.status
        });
      } catch (execErr) {
        console.error('[Submit] TC' + (i+1) + ' FAILED:', execErr.message);
        execResult = {
          success: false,
          status: 'Execution Error',
          stdout: '',
          stderr: execErr.message,
          time: '0'
        };
      }

      const actual = (execResult.stdout || '').trim();
      const expected = (tc.expectedOutput || '').trim();
      const passed = execResult.success && actual === expected;

      if (passed) {
        totalScore += (tc.points || 0);
      }

      testCaseResults.push({
        testCaseIndex: i,
        passed,
        actualOutput: tc.isHidden
          ? (passed ? '(correct)' : '(incorrect)')
          : actual,
        executionTime: parseFloat(execResult.time || 0),
        memoryUsed: 0,
        status: !execResult.success
          ? execResult.status
          : (passed ? 'Accepted' : 'Wrong Answer')
      });
    }

    console.log('[Submit] All test cases done:', {
      totalScore,
      maxMarks: problem.totalMarks,
      results: testCaseResults.map(r => r.status)
    });

    // Count previous attempts
    const prevAttempts = await CodingSubmission.countDocuments({
      studentId: req.user._id,
      problemId: id
    });

    console.log('[Submit] Creating submission document...');

    const submission = await CodingSubmission.create({
      studentId: req.user._id,
      testId: problem.testId,
      problemId: id,
      language,
      sourceCode,
      testCaseResults,
      score: totalScore,
      totalMarks: problem.totalMarks || 10,
      status: 'completed',
      autoSubmitted: req.body.autoSubmitted || false,
      violations: req.body.violations || [],
      mcqResultId: req.body.mcqResultId 
        ? new mongoose.Types.ObjectId(req.body.mcqResultId)
        : null,
      submittedAt: new Date(),
      attemptNumber: prevAttempts + 1
    });

    console.log('[Submit] Submission saved:', submission._id);

    return res.status(201).json({
      success: true,
      submission: {
        _id: submission._id,
        score: totalScore,
        totalMarks: problem.totalMarks || 10,
        testCaseResults,
        passedCount: testCaseResults.filter(r => r.passed).length,
        totalCount: testCaseResults.length
      }
    });

  } catch (error) {
    console.error('[Submit] CRASHED:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      message: 'Submission failed: ' + error.message
    });
  }
};

/**
 * @desc    Get student's own submissions for a test
 * @route   GET /api/coding/:testId/submissions
 * @access  Private (student)
 */
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.find({
      testId: req.params.testId,
      studentId: req.user._id,
    })
      .populate('problemId', 'title problemNo totalMarks')
      .sort({ submittedAt: -1 });

    return res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
};

// ═══════════════════════════════════════════════
//  ADMIN — Submission Viewing
// ═══════════════════════════════════════════════

/**
 * @desc    Get all submissions for a coding test (admin view)
 * @route   GET /api/coding/:testId/all-submissions
 * @access  Private (admin)
 */
exports.getTestSubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.find({
      testId: req.params.testId,
    })
      .populate('studentId', 'name email rollNumber')
      .populate('problemId', 'title problemNo totalMarks')
      .sort({ submittedAt: -1 });

    return res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Get test submissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
};

exports.getCombinedResult = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user._id;

    console.log('getCombinedResult:', {
      testId,
      studentId
    });

    // Get MCQ result
    const mcqResult = await Result.findOne({
        testId,
        studentId
      })
      .populate('testId', 'title subject duration marksPerQuestion testType passingPercentage');

    // Get coding submission (find the LATEST submission for this test)
    const codingSubmission = await CodingSubmission.findOne({
        testId,
        studentId: studentId
      })
      .sort({ submittedAt: -1 })
      .populate({
        path: 'problemId',
        model: 'CodingProblem',
        select: 'title marks totalMarks'
      });

    const allCodingSubmissions = await CodingSubmission.find({
        testId,
        studentId: studentId
      })
      .populate({
        path: 'problemId',
        model: 'CodingProblem',
        select: 'title marks totalMarks description'
      })
      .sort({ submittedAt: 1 });

    if (!mcqResult && allCodingSubmissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No results found for this test'
      });
    }

    // Calculate combined scores
    const mcqScore = mcqResult?.score || 0;
    const mcqTotalMarks = mcqResult?.answers?.length || 0;
    const mcqPercentage = mcqResult?.percentage || 0;

    const codingScore = allCodingSubmissions.reduce(
        (sum, sub) => sum + (sub.score || 0),
        0
      );
    const codingTotalMarks = allCodingSubmissions.reduce(
        (sum, sub) => sum + (sub.totalMarks || 0),
        0
      );
    const codingPercentage = codingTotalMarks > 0
        ? Math.round((codingScore / codingTotalMarks) * 100)
        : 0;

    const totalScore = mcqScore + codingScore;
    const totalPossible = mcqTotalMarks + codingTotalMarks;
    const overallPercentage = totalPossible > 0
        ? Math.round((totalScore / totalPossible) * 100)
        : 0;

    const passingPercentage = mcqResult?.testId?.passingPercentage || 40;
    const passed = overallPercentage >= passingPercentage;

    const combinedResult = {
      testId,
      testTitle: mcqResult?.testId?.title || 'Test',
      testSubject: mcqResult?.testId?.subject || 'General',
      testType: 'combined',

      // MCQ Section
      mcqSection: mcqResult ? {
        resultId: mcqResult._id,
        score: mcqScore,
        totalMarks: mcqTotalMarks,
        percentage: mcqPercentage,
        correctAnswers: mcqResult.correctAnswers || 0,
        incorrectAnswers: mcqResult.incorrectAnswers || 0,
        unattempted: mcqResult.unattempted || 0,
        timeTaken: mcqResult.timeTaken || 0,
        autoSubmitted: mcqResult.autoSubmitted || false,
        submittedAt: mcqResult.submittedAt
      } : null,

      // Coding Section
      codingSection: allCodingSubmissions.length > 0 ? {
          submissions: allCodingSubmissions.map(sub => ({
              submissionId: sub._id,
              problemTitle: sub.problemId?.title || 'Problem',
              language: sub.language,
              score: sub.score || 0,
              totalMarks: sub.totalMarks || 0,
              status: sub.status,
              autoSubmitted: sub.autoSubmitted || false,
              passedTestCases: sub.testCaseResults?.filter(tc => tc.passed).length || 0,
              totalTestCases: sub.testCaseResults?.length || 0,
              submittedAt: sub.submittedAt,
              sourceCode: sub.sourceCode
            })),
          totalScore: codingScore,
          totalMarks: codingTotalMarks,
          percentage: codingPercentage
        } : null,

      // Combined Summary
      summary: {
        totalScore,
        totalPossible,
        overallPercentage,
        passed,
        passingPercentage
      }
    };

    console.log('Combined result built:', {
      mcqScore,
      codingScore,
      totalScore,
      overallPercentage,
      passed
    });

    return res.status(200).json({
      success: true,
      result: combinedResult
    });

  } catch (error) {
    console.error('getCombinedResult error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCombinedResultPDF = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user._id;

    console.log('Combined PDF request:', { testId, studentId });

    // ── Fetch all data ──────────────

    const student = await User.findById(studentId).select(
      'name email rollNumber mobileNumber collegeName branch'
    );

    const test = await Test.findById(testId).select(
      'title subject testType duration marksPerQuestion passingPercentage negativeMarking'
    );

    if (!student || !test) {
      return res.status(404).json({ success: false, message: 'Student or test not found' });
    }

    // MCQ result
    const mcqResult = await Result.findOne({ studentId, testId });

    // MCQ questions + answer key
    const questions = await Question.find({ testId }).sort({ questionNo: 1 });
    const answerKey = await AnswerKey.findOne({ testId });

    // Coding submissions
    const codingSubmissions = await CodingSubmission.find({ studentId, testId })
      .populate('problemId', 'title description marks totalMarks')
      .sort({ submittedAt: 1 });

    // ── Calculate scores ────────────

    const mcqScore = mcqResult?.score || 0;
    const mcqTotal = questions.length || 0;
    const mcqPct = mcqResult?.percentage || 0;

    const codingScore = codingSubmissions.reduce((s, sub) => s + (sub.score || 0), 0);
    const codingTotal = codingSubmissions.reduce((s, sub) => s + (sub.totalMarks || 0), 0);

    const totalScore = mcqScore + codingScore;
    const totalPossible = mcqTotal + codingTotal;
    const overallPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const passing = test.passingPercentage || 40;
    const passed = overallPct >= passing;

    // ── Build MCQ comparison ────────

    const mcqComparison = questions.map(q => {
      const correct = answerKey?.answers?.find(a => a.questionNo === q.questionNo);
      const student_ans = mcqResult?.answers?.find(a => a.questionNo === q.questionNo);
      const correctOpt = correct?.correctOption || '-';
      const givenOpt = student_ans?.selectedOption || null;
      const isCorrect = givenOpt && correctOpt !== '-' && givenOpt.toUpperCase() === correctOpt.toUpperCase();

      return {
        questionNo: q.questionNo,
        questionText: (q.questionText || '').substring(0, 60),
        correct: correctOpt,
        given: givenOpt,
        isCorrect,
        attempted: !!givenOpt
      };
    });

    // ── Create PDF ──────────────────

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const filename = `combined_result_${student.rollNumber || 'student'}_${(test.title || 'test').replace(/\s+/g, '_').substring(0, 20)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // ══════════════════════════════
    // PAGE 1 — Header + Details + Summary
    // ══════════════════════════════

    doc.fontSize(22).fillColor('#3B4FE8').font('Helvetica-Bold').text('SyncTest', 50, 45, { align: 'center' });
    doc.fontSize(11).fillColor('#6B7280').font('Helvetica').text('Combined Examination Result Report', 50, 72, { align: 'center' });

    doc.moveTo(50, 92).lineTo(545, 92).strokeColor('#E5E7EB').stroke();

    let y = 105;
    doc.rect(50, y, 495, 175).fillAndStroke('#EEF2FF', '#E0E7FF');
    doc.fontSize(9).fillColor('#3B4FE8').font('Helvetica-Bold').text('STUDENT DETAILS', 65, y + 12);

    y += 30;
    const lx = 65;
    const rx = 300;

    const field = (label, value, x, fy, labelW = 70) => {
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text(label, x, fy, { width: labelW });
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(String(value || 'N/A').substring(0, 28), x + labelW + 5, fy);
    };

    field('Name:', student?.name, lx, y);
    field('Roll No:', student?.rollNumber, rx, y, 75);
    y += 22;
    field('Email:', student?.email, lx, y);
    field('Branch:', student?.branch, rx, y, 75);
    y += 22;
    field('Mobile:', student?.mobileNumber, lx, y);
    field('Test:', test?.title, rx, y, 75);
    y += 22;
    field('College:', student?.collegeName, lx, y);
    field('Subject:', test?.subject || 'General', rx, y, 75);
    y += 22;
    field('Test Type:', 'MCQ + Coding (Combined)', lx, y);
    field('Date:', new Date(mcqResult?.submittedAt || Date.now()).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }), rx, y, 75);

    y = 300;
    doc.rect(50, y, 495, 130).fillAndStroke('#F9FAFB', '#E5E7EB');
    doc.fontSize(10).fillColor('#3B4FE8').font('Helvetica-Bold').text('RESULT SUMMARY', 65, y + 12);
    y += 30;

    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Total Score:', lx, y);
    doc.fontSize(11).fillColor('#111827').font('Helvetica-Bold').text(`${totalScore} / ${totalPossible} Marks`, lx + 75, y);
    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Overall %:', rx, y);
    doc.fontSize(11).fillColor(passed ? '#059669' : '#DC2626').font('Helvetica-Bold').text(`${overallPct}%`, rx + 75, y);

    y += 22;
    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('MCQ Score:', lx, y);
    doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(`${mcqScore} / ${mcqTotal}  (${mcqPct}%)`, lx + 75, y);
    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Status:', rx, y);
    doc.fontSize(11).fillColor(passed ? '#059669' : '#DC2626').font('Helvetica-Bold').text(passed ? 'PASSED' : 'FAILED', rx + 75, y);

    y += 22;
    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Coding Score:', lx, y);
    doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(`${codingScore} / ${codingTotal}`, lx + 75, y);
    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Passing Mark:', rx, y);
    doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(`${passing}%`, rx + 75, y);

    y += 22;
    doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('MCQ Section:', lx, y);
    doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(`${mcqResult?.correctAnswers || 0} correct, ${mcqResult?.incorrectAnswers || 0} wrong, ${mcqResult?.unattempted || 0} skipped`, lx + 75, y);

    // ══════════════════════════════
    // PAGE 2 — MCQ Answer Sheet
    // ══════════════════════════════

    doc.addPage();
    y = 50;
    doc.fontSize(14).fillColor('#111827').font('Helvetica-Bold').text('MCQ Answer Sheet', 50, y, { align: 'center' });
    y += 30;

    doc.rect(50, y, 495, 22).fill('#3B4FE8');
    doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text('#', 58, y + 7);
    doc.text('Question', 78, y + 7);
    doc.text('Yours', 368, y + 7);
    doc.text('Correct', 418, y + 7);
    doc.text('Result', 473, y + 7);
    y += 22;

    mcqComparison.forEach((item) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
        doc.rect(50, y, 495, 22).fill('#3B4FE8');
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('#', 58, y + 7);
        doc.text('Question', 78, y + 7);
        doc.text('Yours', 368, y + 7);
        doc.text('Correct', 418, y + 7);
        doc.text('Result', 473, y + 7);
        y += 22;
      }
      const rowColor = !item.attempted ? '#FFFBEB' : item.isCorrect ? '#F0FDF4' : '#FEF2F2';
      doc.rect(50, y, 495, 20).fillAndStroke(rowColor, '#E5E7EB');
      doc.fontSize(8).fillColor('#374151').font('Helvetica');
      doc.text(String(item.questionNo), 58, y + 6);
      doc.text((item.questionText || '').substring(0, 52), 78, y + 6);
      doc.text(item.given || '—', 368, y + 6);
      doc.text(item.correct, 418, y + 6);
      doc.fillColor(item.isCorrect ? '#059669' : (item.attempted ? '#DC2626' : '#D97706')).text(item.isCorrect ? '✓' : (item.attempted ? '✗' : '—'), 478, y + 6);
      y += 20;
    });

    y += 5;
    doc.rect(50, y, 495, 22).fill('#F3F4F6');
    doc.fontSize(9).fillColor('#374151').font('Helvetica-Bold').text(`MCQ Total: ${mcqScore}/${mcqTotal} marks  |  Correct: ${mcqResult?.correctAnswers || 0}  Wrong: ${mcqResult?.incorrectAnswers || 0}  Skipped: ${mcqResult?.unattempted || 0}`, 58, y + 7);

    // ══════════════════════════════
    // PAGE 3 — Coding Section
    // ══════════════════════════════

    doc.addPage();
    y = 50;
    doc.fontSize(14).fillColor('#111827').font('Helvetica-Bold').text('Coding Section Results', 50, y, { align: 'center' });
    y += 10;
    doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text(`Total Coding Score: ${codingScore} / ${codingTotal} marks`, 50, y + 20, { align: 'center' });
    y += 45;

    if (codingSubmissions.length === 0) {
      doc.fontSize(11).fillColor('#9CA3AF').font('Helvetica').text('No coding problems attempted.', 50, y, { align: 'center' });
    }

    codingSubmissions.forEach((sub, idx) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      const problemTitle = sub.problemId?.title || `Problem ${idx + 1}`;
      const passedCases = (sub.testCaseResults || []).filter(tc => tc.passed).length;
      const totalCases = (sub.testCaseResults || []).length;
      const isFullyExecuted = sub.status === 'completed' && passedCases === totalCases && totalCases > 0;
      const isPartiallyExecuted = sub.status === 'completed' && passedCases > 0 && passedCases < totalCases;
      const isNotExecuted = sub.status !== 'completed' || (passedCases === 0 && sub.autoSubmitted);
      const headerColor = isFullyExecuted ? '#059669' : isPartiallyExecuted ? '#D97706' : '#DC2626';

      doc.rect(50, y, 495, 28).fill(headerColor);
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica-Bold').text(`Problem ${idx + 1}: ${problemTitle.substring(0, 35)}`, 60, y + 9);
      const statusText = isFullyExecuted ? '✓ Executed Successfully' : isPartiallyExecuted ? '~ Partially Executed' : '✗ Not Executed';
      doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold').text(statusText, 60, y + 9, { align: 'right', width: 475 });
      y += 28;

      doc.rect(50, y, 495, 70).fillAndStroke('#F9FAFB', '#E5E7EB');
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Language:', 65, y + 10);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text((sub.language || 'N/A').toUpperCase(), 135, y + 10);
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Score:', 300, y + 10);
      doc.fontSize(10).fillColor('#3B4FE8').font('Helvetica-Bold').text(`${sub.score || 0} / ${sub.totalMarks || 0} marks`, 340, y + 10);
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Test Cases:', 65, y + 30);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(`${passedCases} / ${totalCases} passed`, 135, y + 30);
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Submission:', 300, y + 30);
      doc.fontSize(10).fillColor(sub.autoSubmitted ? '#DC2626' : '#059669').font('Helvetica-Bold').text(sub.autoSubmitted ? 'Auto-Submitted' : 'Manual Submit', 370, y + 30);
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text('Execution:', 65, y + 50);
      doc.fontSize(9).fillColor(headerColor).font('Helvetica-Bold').text(statusText, 135, y + 50);
      y += 80;

      if (totalCases > 0) {
        doc.rect(50, y, 495, 18).fill('#374151');
        doc.fontSize(8).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('TC #', 58, y + 5);
        doc.text('Status', 100, y + 5);
        doc.text('Result', 200, y + 5);
        doc.text('Time', 420, y + 5);
        y += 18;

        sub.testCaseResults.forEach((tc, ti) => {
          if (y > 760) {
            doc.addPage();
            y = 50;
          }
          const tcColor = tc.passed ? '#F0FDF4' : '#FEF2F2';
          doc.rect(50, y, 495, 18).fillAndStroke(tcColor, '#E5E7EB');
          doc.fontSize(8).fillColor('#374151').font('Helvetica');
          doc.text(`TC ${ti + 1}`, 58, y + 5);
          doc.text(tc.status || 'Unknown', 100, y + 5, { width: 90 });
          const outputDisplay = typeof tc.actualOutput === 'string' && (tc.actualOutput === '(correct)' || tc.actualOutput === '(incorrect)') ? tc.actualOutput : (tc.actualOutput || '').substring(0, 20);
          doc.text(outputDisplay, 200, y + 5, { width: 210 });
          doc.fillColor(tc.passed ? '#059669' : '#DC2626').text(tc.passed ? '✓ Pass' : '✗ Fail', 420, y + 5);
          y += 18;
        });
      }
      y += 16;
    });

    if (y > 730) {
      doc.addPage();
      y = 50;
    }
    y += 5;
    doc.rect(50, y, 495, 24).fill('#EEF2FF');
    doc.fontSize(10).fillColor('#3B4FE8').font('Helvetica-Bold').text(`Coding Total: ${codingScore} / ${codingTotal} marks  |  ${codingSubmissions.length} problem(s) attempted`, 58, y + 8);

    // ══════════════════════════════
    // FOOTER on last page
    // ══════════════════════════════

    doc.fontSize(8).fillColor('#9CA3AF').font('Helvetica').text('Generated by SyncTest  |  ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), 50, doc.page.height - 30, { align: 'center', width: 495 });
    doc.end();
    console.log('Combined PDF generated successfully for:', student.email);

  } catch (error) {
    console.error('Combined PDF error:', error.message);
    console.error(error.stack);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'PDF generation failed: ' + error.message });
    }
  }
};
