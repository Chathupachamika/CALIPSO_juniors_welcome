const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('teamId');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('teamId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, email, teamId } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (teamId) updates.teamId = teamId;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
