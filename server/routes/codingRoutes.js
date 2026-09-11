const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createProblem,
  getProblems,
  updateProblem,
  deleteProblem,
  getStudentProblems,
  runCode,
  submitSolution,
  getSubmissions,
  getTestSubmissions,
  getCombinedResult,
  getCombinedResultPDF,
} = require('../controllers/codingController');

// ─── Admin Routes ───
router.post('/:testId/problems', protect, authorize('admin'), createProblem);
router.get('/:testId/problems', protect, authorize('admin'), getProblems);
router.put('/problems/:id', protect, authorize('admin'), updateProblem);
router.delete('/problems/:id', protect, authorize('admin'), deleteProblem);
router.get('/:testId/all-submissions', protect, authorize('admin'), getTestSubmissions);

router.get(
  '/test-compiler',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { executeCode } = require('../utils/piston');
      
      const result = await executeCode(
        'python',
        'print("JDoodle OK")',
        ''
      );
      
      return res.json({
        success: true,
        output: result.stdout,
        status: result.status,
        message: 'JDoodle working correctly'
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);
// ─── Student Routes ───
router.get('/:testId/student-problems', protect, authorize('student'), getStudentProblems);
router.post('/run', protect, authorize('student'), runCode);
router.post('/problems/:id/submit', protect, authorize('student'), submitSolution);
router.get('/:testId/submissions', protect, authorize('student'), getSubmissions);

router.get('/combined-result/:testId', protect, getCombinedResult);

router.get(
  '/combined-result/:testId/pdf',
  protect,
  async (req, res, next) => {
    if (req.user.role === 'admin' && req.query.studentId) {
      req.user._id = req.query.studentId;
    }
    next();
  },
  getCombinedResultPDF
);

router.get(
  '/admin/combined-result/:testId/:studentId',
  protect,
  authorize('admin'),
  async (req, res, next) => {
    req.user._id = req.params.studentId;
    next();
  },
  getCombinedResult
);

module.exports = router;
