const express = require('express');
const crypto = require('crypto');
const QRCodeLib = require('qrcode'); // npm package for generating QR images
const router = express.Router();

const QRCode = require('../models/QRCode');
const Scan = require('../models/Scan');
const User = require('../models/User');
const Team = require('../models/Team');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ADMIN: create a new secret QR code
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { label, points } = req.body;
    if (!points) return res.status(400).json({ error: 'Points value is required' });

    const code = crypto.randomBytes(8).toString('hex');
    const qr = await QRCode.create({ code, label, points });
    res.status(201).json(qr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: list all codes (with basic scan stats)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const codes = await QRCode.find().sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      codes.map(async (qr) => {
        const scanCount = await Scan.countDocuments({ qrCode: qr._id });
        return { ...qr.toObject(), scanCount };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: get a printable QR image (PNG data URL) for a code
router.get('/:id/image', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);
    if (!qr) return res.status(404).json({ error: 'QR code not found' });

    const scanUrl = `${process.env.CLIENT_URL}/scan/${qr.code}`;
    const image = await QRCodeLib.toDataURL(scanUrl, { width: 500, margin: 2 });

    res.json({ image, url: scanUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: deactivate/delete a code
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await QRCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'QR code deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PARTICIPANT: scan a code (must be logged in)
router.post('/scan', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.teamId) {
      return res.status(400).json({ error: 'You are not assigned to a team yet' });
    }

    const qr = await QRCode.findOne({ code, isActive: true });
    if (!qr) return res.status(404).json({ error: 'Invalid or inactive QR code' });

    const alreadyScanned = await Scan.findOne({ qrCode: qr._id, team: user.teamId });
    if (alreadyScanned) {
      return res.status(409).json({
        error: 'Your team already scanned this code',
        points: qr.points,
      });
    }

    await Scan.create({ qrCode: qr._id, team: user.teamId, scannedBy: user._id });

    const team = await Team.findByIdAndUpdate(
      user.teamId,
      { $inc: { score: qr.points } },
      { new: true }
    );

    res.json({
      message: `QR scanned successfully! ${qr.label ? `(${qr.label})` : ''}`.trim(),
      pointsAwarded: qr.points,
      teamScore: team ? team.score : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;