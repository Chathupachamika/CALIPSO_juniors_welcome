const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { verifyToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role || 'junior'
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('teamId')
      .select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
