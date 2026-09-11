const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCSV } = require('../middleware/upload');

// All test routes require authentication
router.use(protect);

// Admin dashboard stats
router.get('/stats/dashboard', authorize('admin'), testController.getDashboardStats);

// CRUD
router.get('/', testController.getTests);
router.get('/:id', testController.getTestById);
router.post('/', authorize('admin'), testController.createTest);
router.put('/:id', authorize('admin'), testController.updateTest);
router.delete('/:id', authorize('admin'), testController.deleteTest);
router.put('/:id/publish', authorize('admin'), testController.publishTest);

// Questions
router.get('/:id/questions', testController.getQuestions);
router.post('/:id/questions', authorize('admin'), testController.addQuestionsManually);
router.post(
  '/:id/questions/csv',
  authorize('admin'),
  uploadCSV.single('file'),
  testController.uploadQuestionsCSV
);

// Answer Key (admin only — never expose to students)
router.get('/:id/answerkey', authorize('admin'), testController.getAnswerKey);
router.post('/:id/answerkey', authorize('admin'), testController.uploadAnswerKey);

module.exports = router;
