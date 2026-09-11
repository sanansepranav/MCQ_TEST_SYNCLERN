const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// Student-specific routes (must come before /:id to avoid conflict)
router.get('/students', userController.getAllStudents);
router.get('/students/:id', userController.getStudentById);
router.get('/students/:id/results', userController.getStudentResults);
router.delete('/students/:id', userController.deleteStudent);

// General user CRUD
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/toggle-active', userController.toggleActive);

module.exports = router;
