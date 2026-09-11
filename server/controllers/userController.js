const User = require('../models/User');
const Result = require('../models/Result');
const Violation = require('../models/Violation');

/**
 * @desc    Get all users (paginated, filterable)
 * @route   GET /api/users
 * @access  Private (admin)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { rollNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students (admin view)
 * @route   GET /api/users/students
 * @access  Private (admin)
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = { role: 'student' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { rollNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      User.find(filter)
        .select('name email rollNumber mobileNumber collegeName branch isActive department createdAt lastLogin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student by ID
 * @route   GET /api/users/students/:id
 * @access  Private (admin)
 */
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id)
      .select('name email rollNumber phone department isActive createdAt lastLogin');

    if (!student || student.role === 'admin') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all results for a specific student
 * @route   GET /api/users/students/:id/results
 * @access  Private (admin)
 */
exports.getStudentResults = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).select('name email rollNumber');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const results = await Result.find({ studentId: req.params.id })
      .populate('testId', 'title subject totalMarks duration startTime')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { student, results },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (admin)
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (admin)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle student active status
 * @route   PUT /api/users/:id/toggle-active
 * @access  Private (admin)
 */
exports.toggleActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Delete student request:', id);

    // Find student first
    const student = await User.findById(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Prevent deleting admin accounts
    if (student.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    // Delete all student's results
    const resultsDeleted = await Result.deleteMany({ studentId: id });
    console.log('Results deleted:', resultsDeleted.deletedCount);

    // Delete all student's violations
    const violationsDeleted = await Violation.deleteMany({ studentId: id });
    console.log('Violations deleted:', violationsDeleted.deletedCount);

    // Delete the student account
    await User.findByIdAndDelete(id);
    
    console.log('Student deleted:', student.email);

    return res.status(200).json({
      success: true,
      message: `Student "${student.name}" has been permanently deleted along with all their results.`
    });

  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
};
