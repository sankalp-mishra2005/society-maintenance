import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register new resident user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, flatNumber, phoneNumber } = req.body;

    if (!name || !email || !password || !flatNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password, flatNumber)' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Public registration creates RESIDENT role ONLY
    const user = await User.create({
      name,
      email,
      password,
      role: 'resident',
      flatNumber,
      phoneNumber: phoneNumber || ''
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        flatNumber: user.flatNumber,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          flatNumber: user.flatNumber,
          phoneNumber: user.phoneNumber,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[Login Error]:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};
