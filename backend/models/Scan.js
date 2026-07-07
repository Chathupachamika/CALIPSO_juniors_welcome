const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    qrCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// A team can only score a given QR code once
scanSchema.index({ qrCode: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('Scan', scanSchema);