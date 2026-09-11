const PDFDocument = require('pdfkit');
const Result = require('../models/Result');
const Test = require('../models/Test');
const AnswerKey = require('../models/AnswerKey');
const Violation = require('../models/Violation');
const Question = require('../models/Question');
const evaluateAnswers = require('../utils/evaluateAnswers');

// ─── Color palette ───
const COLORS = {
  primary: '#4f46e5',   // Indigo-600
  dark: '#1e1b4b',      // Indigo-950
  text: '#111827',       // Gray-900
  textMuted: '#6b7280',  // Gray-500
  green: '#059669',      // Emerald-600
  greenBg: '#d1fae5',   // Emerald-100
  red: '#dc2626',        // Red-600
  redBg: '#fee2e2',     // Red-100
  amber: '#d97706',      // Amber-600
  amberBg: '#fef3c7',   // Amber-100
  border: '#e5e7eb',     // Gray-200
  headerBg: '#eef2ff',  // Indigo-50
  white: '#ffffff',
};

// ─── PDF helper functions ───
function drawHr(doc, y, width) {
  doc.moveTo(40, y).lineTo(width - 40, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
}

function drawBox(doc, x, y, w, h, { fill = COLORS.white, stroke = COLORS.border } = {}) {
  doc.roundedRect(x, y, w, h, 4).fillAndStroke(fill, stroke);
}

function drawKeyValue(doc, x, y, label, value, opts = {}) {
  const { labelWidth = 130, fontSize = 9 } = opts;
  doc.fillColor(COLORS.textMuted).fontSize(fontSize).text(label, x, y, { width: labelWidth });
  doc.fillColor(COLORS.text).fontSize(fontSize).text(value, x + labelWidth, y);
}

function formatTime(sec) {
  if (!sec) return '0m 0s';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// ═══════════════════════════════════════════════════
//  Existing controllers (unchanged)
// ═══════════════════════════════════════════════════

/**
 * @desc    Submit test answers (student) — legacy route
 * @route   POST /api/results/submit
 */
exports.submitTest = async (req, res, next) => {
  try {
    const { testId, answers, timeTaken, autoSubmitted, violations } = req.body;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const attemptCount = await Result.countDocuments({ testId, studentId: req.user._id });
    if (attemptCount >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${test.maxAttempts}) reached`,
      });
    }

    // Fetch questions + answer key for evaluation
    const questions = await Question.find({ testId }).sort({ questionNo: 1 });
    const answerKey = await AnswerKey.findOne({ testId });

    const evaluation = evaluateAnswers({
      studentAnswers: answers || [],
      answerKeyMap: answerKey ? answerKey.answers : [],
      questions,
      marksPerQuestion: test.marksPerQuestion,
      negativeMarking: test.negativeMarking,
      negativeMarks: test.negativeMarks || 0.25,
    });

    // Save violations
    if (violations && violations.length > 0) {
      const violationDocs = violations.map((v) => ({
        studentId: req.user._id,
        testId,
        violationType: v.type,
        timestamp: v.timestamp || new Date(),
        description: v.description || '',
      }));
      await Violation.insertMany(violationDocs);
    }

    const result = await Result.create({
      testId,
      studentId: req.user._id,
      answers,
      score: evaluation.score,
      totalMarks: evaluation.totalMarks,
      correctAnswers: evaluation.correctCount,
      incorrectAnswers: evaluation.incorrectCount,
      unattempted: evaluation.unattemptedCount,
      percentage: evaluation.percentage,
      timeTaken: timeTaken || 0,
      attemptNumber: attemptCount + 1,
      autoSubmitted: autoSubmitted || false,
      violations: violations || [],
      status: 'graded',
      submittedAt: new Date(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Test submitted and graded',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/** @route GET /api/results/my-results */
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('testId', 'title subject totalMarks duration')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) { next(error); }
};

/** @route GET /api/results/test/:testId */
exports.getResultsByTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId).select('title subject totalMarks passingPercentage');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const results = await Result.find({ testId: req.params.testId })
      .populate('studentId', 'name email rollNumber department')
      .sort({ score: -1 });

    const resultsWithViolations = await Promise.all(
      results.map(async (r) => {
        const rObj = r.toObject();
        rObj.violationCount = await Violation.countDocuments({
          studentId: r.studentId?._id,
          testId: req.params.testId,
        });
        return rObj;
      })
    );

    res.json({ success: true, data: { test, results: resultsWithViolations } });
  } catch (error) { next(error); }
};

/** @route GET /api/results */
exports.getAllResults = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.testId) filter.testId = req.query.testId;

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate('studentId', 'name email rollNumber')
        .populate('testId', 'title subject totalMarks')
        .sort({ submittedAt: -1 })
        .skip(skip).limit(limit),
      Result.countDocuments(filter),
    ]);

    const resultsWithViolations = await Promise.all(
      results.map(async (r) => {
        const rObj = r.toObject();
        rObj.violationCount = await Violation.countDocuments({
          studentId: r.studentId?._id, testId: r.testId?._id,
        });
        return rObj;
      })
    );

    res.json({
      success: true,
      data: resultsWithViolations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

/** @route GET /api/results/:id */
exports.getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('testId')
      .populate('studentId', 'name email rollNumber department');

    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    if (req.user.role === 'student' && result.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const rObj = {
      ...result.toObject(),
      correctAnswers: result.correctAnswers || 0,
      incorrectAnswers: result.incorrectAnswers || 0,
      unattempted: result.unattempted || 0,
      score: result.score || 0,
      percentage: result.percentage || 0,
      timeTaken: result.timeTaken || 0
    };
    if (req.user.role === 'admin') {
      rObj.questions = await Question.find({ testId: result.testId._id }).sort({ questionNo: 1 });
      rObj.answerKey = await AnswerKey.findOne({ testId: result.testId._id });
      rObj.violationCount = await Violation.countDocuments({
        studentId: result.studentId._id, testId: result.testId._id,
      });
    }

    res.json({ success: true, data: rObj });
  } catch (error) { next(error); }
};

/** @route PUT /api/results/:id/grade */
exports.gradeResult = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    if (score !== undefined) result.score = score;
    if (feedback) result.feedback = feedback;
    result.status = 'graded';
    await result.save();
    res.json({ success: true, message: 'Result graded successfully', data: result });
  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════
//  PDF GENERATION — Single Student Result
// ═══════════════════════════════════════════════════

/**
 * @desc    Export single student result as professional PDF (pdfkit)
 * @route   GET /api/results/:id/export-pdf
 * @access  Private (admin or owning student)
 */
exports.exportSingleResultPDF = async (req, res) => {
  try {
    console.log('PDF request for:', req.params.id);

    // 1. Fetch result with populated fields
    const result = await Result.findById(
      req.params.id
    )
    .populate('studentId', 
      'name email rollNumber mobileNumber collegeName branch')
    .populate('testId',
      'title subject duration marksPerQuestion negativeMarking negativeMarks passingPercentage');

    if (!result) {
      return res.status(404).json({
        message: 'Result not found'
      });
    }

    const student = result.studentId;
    const test = result.testId;

    // 2. Fetch questions and answer key
    const questions = await Question.find({
      testId: test._id
    }).sort({ questionNo: 1 });

    const answerKey = await AnswerKey.findOne({
      testId: test._id
    });

    // 3. Build comparison
    const comparison = (questions || []).map(q => {
      const ca = answerKey?.answers?.find(
        a => a.questionNo === q.questionNo
      );
      const sa = (result.answers || []).find(
        a => a.questionNo === q.questionNo
      );
      const correct = ca?.correctOption || '-';
      const given = sa?.selectedOption || null;
      const isCorrect = given && correct !== '-' &&
        given.toUpperCase() === 
        correct.toUpperCase();
      return {
        questionNo: q.questionNo,
        questionText: (q.questionText || '')
          .substring(0, 100),
        correct,
        given,
        isCorrect
      };
    });

    // 4. Create PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });

    // 5. Set response headers
    const filename = `result_${
      student?.rollNumber || 'student'
    }_${
      (test?.title || 'test')
        .replace(/\s+/g, '_')
    }.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    doc.pipe(res);

    // 6. PAGE 1 - Header
    doc.fontSize(22)
       .fillColor('#3B4FE8')
       .font('Helvetica-Bold')
       .text('SyncTest', 
          50, 50, { align: 'center' });
    
    doc.fontSize(12)
       .fillColor('#6B7280')
       .font('Helvetica')
       .text('Examination Result Report',
         50, 78, { align: 'center' });

    doc.moveTo(50, 100)
       .lineTo(545, 100)
       .strokeColor('#E5E7EB')
       .stroke();

    // 7. Student Details Box
    let y = 115;
    doc.rect(50, y, 495, 170)
       .fillAndStroke('#EEF2FF', '#E0E7FF');

    doc.fontSize(10)
       .fillColor('#3B4FE8')
       .font('Helvetica-Bold')
       .text('STUDENT DETAILS', 65, y + 12);

    y += 30;
    const lx = 65;
    const rx = 300;

    const drawField = (label, value, x, fy) => {
      doc.fontSize(9)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text(label, x, fy);
      doc.fontSize(10)
         .fillColor('#111827')
         .font('Helvetica-Bold')
         .text(
           String(value || 'N/A')
             .substring(0, 30),
           x + 70, fy
         );
    };

    drawField('Name:', 
      student?.name, lx, y);
    drawField('Roll No:', 
      student?.rollNumber, rx, y);
    y += 22;
    drawField('Email:', 
      student?.email, lx, y);
    drawField('Branch:', 
      student?.branch, rx, y);
    y += 22;
    drawField('Mobile:', 
      student?.mobileNumber, lx, y);
    drawField('Test:', 
      test?.title, rx, y);
    y += 22;
    drawField('College:', 
      student?.collegeName, lx, y);
    drawField('Subject:', 
      test?.subject || 'General', rx, y);
    y += 22;
    drawField('Date:', 
      new Date(result.submittedAt)
        .toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
      lx, y
    );
    drawField('Type:', 
      result.autoSubmitted ? 
        'Auto-Submitted' : 'Manual',
      rx, y
    );

    // 8. Result Summary Box
    y += 40;
    doc.rect(50, y, 495, 140)
       .fillAndStroke('#F9FAFB', '#E5E7EB');

    doc.fontSize(10)
       .fillColor('#3B4FE8')
       .font('Helvetica-Bold')
       .text('RESULT SUMMARY', 65, y + 12);

    y += 30;
    const totalQ = questions?.length || 0;
    const correct = result?.correctAnswers || 0;
    const incorrect = result?.incorrectAnswers || 0;
    const unattempted = result?.unattempted || 0;
    const score = result?.score || 0;
    const pct = result?.percentage || 0;
    const passing = 
      test?.passingPercentage || 40;
    const passed = pct >= passing;

    const summaryFields = [
      ['Total Questions', totalQ, 
       'Attempted', correct + incorrect],
      ['Correct', correct, 
       'Incorrect', incorrect],
      ['Unattempted', unattempted, 
       'Marks', `${score}/${totalQ}`],
      ['Percentage', `${pct}%`,
       'Status', passed ? 'PASSED' : 'FAILED'],
      ['Time Taken', 
       (() => {
         const s = result?.timeTaken || 0;
         return `${Math.floor(s/60)}m ${s%60}s`;
       })(),
       'Submitted', 
       new Date(result.submittedAt)
         .toLocaleString('en-IN', {
           timeZone: 'Asia/Kolkata',
           day: '2-digit',
           month: 'short',
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit',
           hour12: true
         })
      ]
    ];

    summaryFields.forEach(
      ([l1, v1, l2, v2]) => {
        doc.fontSize(9)
           .fillColor('#6B7280')
           .font('Helvetica')
           .text(l1 + ':', lx, y);
        doc.fontSize(10)
           .fillColor('#111827')
           .font('Helvetica-Bold')
           .text(String(v1), lx + 90, y);
        doc.fontSize(9)
           .fillColor('#6B7280')
           .font('Helvetica')
           .text(l2 + ':', rx, y);
        doc.fontSize(10)
           .fillColor(
             l2 === 'Status'
               ? (passed ? '#059669' : '#DC2626')
               : '#111827'
           )
           .font('Helvetica-Bold')
           .text(String(v2), rx + 90, y);
        y += 20;
      }
    );

    // 9. PAGE 2 - Answer Comparison
    doc.addPage();
    y = 50;

    doc.fontSize(14)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text('Answer Sheet Comparison', 
         50, y, { align: 'center' });
    y += 30;

    // Table header
    doc.rect(50, y, 495, 24)
       .fill('#3B4FE8');
    doc.fontSize(9)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold');
    doc.text('#', 58, y + 7);
    doc.text('Question', 80, y + 7);
    doc.text('Yours', 370, y + 7);
    doc.text('Correct', 420, y + 7);
    doc.text('Result', 475, y + 7);
    y += 24;

    // Table rows
    comparison.forEach((item, idx) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }

      const rowColor = !item.given
        ? '#FFFBEB'
        : item.isCorrect
          ? '#F0FDF4'
          : '#FEF2F2';

      doc.rect(50, y, 495, 22)
         .fillAndStroke(rowColor, '#E5E7EB');

      doc.fontSize(8)
         .fillColor('#374151')
         .font('Helvetica');
      doc.text(
        String(item.questionNo), 58, y + 6);
      doc.text(
        (item.questionText || '')
          .substring(0, 55),
        80, y + 6
      );
      doc.text(
        item.given || '—', 370, y + 6);
      doc.text(
        item.correct, 420, y + 6);
      doc.text(
        item.isCorrect ? '✓' : 
          (item.given ? '✗' : '—'),
        480, y + 6
      );
      y += 22;
    });

    // 10. PAGE 3 - Security Report
    // (only if violations exist)
    if (result.autoSubmitted || 
        (result.violations && 
         result.violations.length > 0)) {
      doc.addPage();
      y = 50;

      doc.fontSize(14)
         .fillColor('#DC2626')
         .font('Helvetica-Bold')
         .text('Security Report', 
           50, y, { align: 'center' });
      y += 40;

      if (result.autoSubmitted) {
        doc.rect(50, y, 495, 40)
           .fillAndStroke('#FEF2F2', '#FECACA');
        doc.fontSize(10)
           .fillColor('#DC2626')
           .font('Helvetica-Bold')
           .text(
             '⚠ This test was auto-submitted ' +
             'due to a security violation.',
             65, y + 12
           );
        y += 55;
      }

      const violations = 
        result.violations || [];
      if (violations.length > 0) {
        violations.forEach((v, i) => {
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica')
             .text(
               `${i+1}. ${v.type || 'Unknown'} - ${
                 new Date(v.timestamp)
                   .toLocaleString('en-IN', {
                     timeZone: 'Asia/Kolkata'
                   })
               }`,
               65, y
             );
          y += 20;
        });
      }
    }

    // 11. Footer
    doc.fontSize(8)
       .fillColor('#9CA3AF')
       .font('Helvetica')
       .text(
         'Generated by SyncTest | ' +
         new Date().toLocaleString('en-IN', {
           timeZone: 'Asia/Kolkata'
         }),
         50,
         doc.page.height - 30,
         { align: 'center' }
       );

    doc.end();
    console.log('PDF generated successfully');

  } catch (error) {
    console.error('PDF Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'PDF generation failed: ' + 
          error.message
      });
    }
  }
};

// ═══════════════════════════════════════════════════
//  PDF GENERATION — All Students for a Test (Admin)
// ═══════════════════════════════════════════════════

/**
 * @desc    Export all students' results for a test as PDF
 * @route   GET /api/results/test/:testId/export-pdf
 * @access  Private (admin)
 */
exports.exportResultsPDF = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const results = await Result.find({ testId: req.params.testId })
      .populate('studentId', 'name email rollNumber department')
      .sort({ score: -1 });

    const passingPct = test.passingPercentage || 40;

    // Statistics
    const scores = results.map((r) => r.percentage || 0);
    const passCount = scores.filter((s) => s >= passingPct).length;
    const failCount = scores.length - passCount;
    const highest = scores.length ? Math.max(...scores) : 0;
    const lowest = scores.length ? Math.min(...scores) : 0;
    const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // ─── Create PDF ───
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40, bufferPages: true });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      const safeName = `results_${test.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      res.send(pdfBuffer);
    });

    const pageW = doc.page.width;
    const contentW = pageW - 80;

    // Header
    doc.fontSize(18).fillColor(COLORS.primary).text('SyncTest', 40, 30, { align: 'center' });
    doc.fontSize(10).fillColor(COLORS.textMuted).text('Test Results Summary Report', 40, 52, { align: 'center' });
    drawHr(doc, 68, pageW);

    // Test Info
    let y = 78;
    drawBox(doc, 40, y, contentW, 48, { fill: COLORS.headerBg });
    doc.fontSize(9).fillColor(COLORS.primary).text('TEST INFORMATION', 55, y + 8);
    y += 22;
    drawKeyValue(doc, 55, y, 'Test:', test.title, { labelWidth: 60 });
    drawKeyValue(doc, 55 + contentW / 3, y, 'Subject:', test.subject || 'N/A', { labelWidth: 60 });
    drawKeyValue(doc, 55 + (contentW / 3) * 2, y, 'Generated:', formatDate(new Date()), { labelWidth: 80 });

    // Statistics Box
    y = 138;
    drawBox(doc, 40, y, contentW, 45, { fill: COLORS.white });
    doc.fontSize(9).fillColor(COLORS.primary).text('STATISTICS', 55, y + 8);
    y += 22;
    const statCol = contentW / 6;
    const stats = [
      ['Total Appeared', results.length],
      ['Highest Score', `${highest}%`],
      ['Lowest Score', `${lowest}%`],
      ['Average Score', `${average}%`],
      ['Passed', passCount],
      ['Failed', failCount],
    ];
    stats.forEach((s, i) => {
      const sx = 55 + i * statCol;
      doc.fontSize(7).fillColor(COLORS.textMuted).text(s[0], sx, y);
      doc.fontSize(10).fillColor(COLORS.text).text(String(s[1]), sx, y + 10);
    });

    // Results Table
    y = 200;
    const colWidths = [40, 55, 170, 85, 55, 55, 55, 55, 55, 60];
    const headers = ['Rank', 'Roll No', 'Student Name', 'Email', 'Score', 'Total', '%', 'Status', 'Auto', 'Time'];

    const drawRow = (ry, cells, opts = {}) => {
      const { bg = COLORS.white, isHeader = false } = opts;
      const rowH = isHeader ? 20 : 18;
      doc.rect(40, ry, contentW, rowH).fill(bg);

      let x = 45;
      cells.forEach((cell, i) => {
        doc.fillColor(isHeader ? COLORS.white : COLORS.text)
          .fontSize(isHeader ? 7.5 : 7)
          .text(String(cell).substring(0, 30), x, ry + (isHeader ? 5 : 4), { width: colWidths[i] - 5, lineBreak: false });
        x += colWidths[i];
      });
      doc.rect(40, ry, contentW, rowH).strokeColor(COLORS.border).lineWidth(0.3).stroke();
    };

    drawRow(y, headers, { bg: COLORS.primary, isHeader: true });
    y += 20;

    results.forEach((r, i) => {
      if (y + 20 > doc.page.height - 50) {
        doc.addPage();
        y = 40;
        drawRow(y, headers, { bg: COLORS.primary, isHeader: true });
        y += 20;
      }

      const pct = r.percentage || 0;
      const pass = pct >= passingPct;
      const bg = pass ? COLORS.greenBg : COLORS.redBg;

      drawRow(y, [
        i + 1,
        r.studentId?.rollNumber || 'N/A',
        r.studentId?.name || 'N/A',
        r.studentId?.email || 'N/A',
        r.score,
        r.totalMarks,
        `${pct}%`,
        pass ? 'PASS' : 'FAIL',
        r.autoSubmitted ? 'Yes' : 'No',
        formatTime(r.timeTaken),
      ], { bg });
      y += 18;
    });

    // Page numbers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor(COLORS.textMuted)
        .text(`Page ${i + 1} of ${totalPages}  |  SyncTest — System Generated Report`,
          40, doc.page.height - 30, { align: 'center', width: contentW });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
