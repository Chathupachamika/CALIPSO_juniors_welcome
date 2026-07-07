const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const TEAMS_CONFIG = [
  { name: 'Earth', color: '#22c55e' },
  { name: 'Water', color: '#3b82f6' },
  { name: 'Fire', color: '#ef4444' },
  { name: 'Air', color: '#fbbf24' }
];

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', '-password')
      .sort({ score: -1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', '-password');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    const teamConfig = TEAMS_CONFIG.find(t => t.name === name);
    if (!teamConfig) {
      return res.status(400).json({ error: 'Invalid team name' });
    }

    const team = new Team({
      name,
      color: teamConfig.color,
      description: description || ''
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { description, score } = req.body;
    const updates = {};

    if (description !== undefined) updates.description = description;
    if (score !== undefined) updates.score = score;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('members', '-password');

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to team (Admin only)
router.post('/:id/members', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', '-password');

    await User.findByIdAndUpdate(userId, { teamId: req.params.id });

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member from team (Admin only)
router.delete('/:id/members/:userId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate('members', '-password');

    await User.findByIdAndUpdate(req.params.userId, { teamId: null });

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
