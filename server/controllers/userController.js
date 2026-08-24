import User from '../models/User.js';

// @desc    Get all users (directory)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ flatNumber: 1, name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, flatNumber, phoneNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'resident',
      flatNumber: role === 'admin' ? undefined : flatNumber,
      phoneNumber
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        flatNumber: user.flatNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
