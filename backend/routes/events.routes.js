const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ sequence: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, sequence } = req.body;

    if (!title || !startTime || !sequence) {
      return res.status(400).json({ error: 'Title, startTime, and sequence are required' });
    }

    const event = new Event({
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      location: location || '',
      sequence: parseInt(sequence),
      status: 'pending'
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, status, sequence } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (startTime) updates.startTime = new Date(startTime);
    if (endTime) updates.endTime = new Date(endTime);
    if (location !== undefined) updates.location = location;
    if (status) updates.status = status;
    if (sequence) updates.sequence = parseInt(sequence);

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
