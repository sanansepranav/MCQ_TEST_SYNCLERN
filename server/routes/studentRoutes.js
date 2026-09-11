const express = require('express');
const router = express.Router();
const studentTestController = require('../controllers/studentTestController');
const resultController = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');
const Result = require('../models/Result');

// All student routes require authentication + student role
router.use(protect);
router.use(authorize('student'));

// Tests
router.get('/tests', studentTestController.getAvailableTests);
router.get('/tests/:id/start', studentTestController.getTestForAttempt);
router.post('/tests/:id/submit', studentTestController.submitTest);

// Results
router.get('/results', studentTestController.getMyResults);
router.get('/results/:id', studentTestController.getResultDetail);

// PDF export (reuses the shared controller — ownership check is inside)
router.get(
  '/results/:id/pdf',
  async (req, res, next) => {
    // Verify student owns this result
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    if (result.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  },
  resultController.exportSingleResultPDF
);

module.exports = router;
