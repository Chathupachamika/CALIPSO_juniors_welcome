const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Team = require('../models/Team');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get leaderboard (all teams with scores)
router.get('/', async (req, res) => {
  try {
    const leaderboard = await Team.find()
      .select('name color score members')
      .sort({ score: -1 });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scores for specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const scores = await Score.find({ teamId: req.params.teamId })
      .populate('eventId', 'title')
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add score (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { teamId, eventId, points, notes } = req.body;

    if (!teamId || !eventId || points === undefined) {
      return res.status(400).json({ error: 'teamId, eventId, and points are required' });
    }

    const score = new Score({
      teamId,
      eventId,
      points: parseInt(points),
      addedBy: req.user.id,
      notes: notes || ''
    });

    await score.save();

    // Update team score
    const newTeamScore = await Score.aggregate([
      { $match: { teamId: require('mongoose').Types.ObjectId(teamId) } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const totalScore = newTeamScore[0]?.total || 0;
    await Team.findByIdAndUpdate(teamId, { score: totalScore });

    // Emit real-time update via socket.io if available
    if (req.app.io) {
      req.app.io.emit('scoreUpdated', { teamId, newScore: totalScore });
    }

    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update score (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { points, notes } = req.body;
    const updates = {};

    if (points !== undefined) updates.points = parseInt(points);
    if (notes !== undefined) updates.notes = notes;

    const score = await Score.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Recalculate team score
    const newTeamScore = await Score.aggregate([
      { $match: { teamId: score.teamId } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const totalScore = newTeamScore[0]?.total || 0;
    await Team.findByIdAndUpdate(score.teamId, { score: totalScore });

    res.json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete score (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Recalculate team score
    const newTeamScore = await Score.aggregate([
      { $match: { teamId: score.teamId } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const totalScore = newTeamScore[0]?.total || 0;
    await Team.findByIdAndUpdate(score.teamId, { score: totalScore });

    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
