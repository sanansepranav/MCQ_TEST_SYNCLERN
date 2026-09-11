const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

// All result routes require authentication
router.use(protect);

// Student routes
router.post('/submit', resultController.submitTest);
router.get('/my-results', resultController.getMyResults);

// Admin routes
router.get('/', authorize('admin'), resultController.getAllResults);
router.get('/test/:testId', authorize('admin'), resultController.getResultsByTest);
router.get('/test/:testId/export-pdf', authorize('admin'), resultController.exportResultsPDF);

// Shared (with role check inside controller)
router.get('/:id', resultController.getResultById);

// Admin only
router.put('/:id/grade', authorize('admin'), resultController.gradeResult);
router.get('/:id/export-pdf', authorize('admin'), resultController.exportSingleResultPDF);

module.exports = router;
