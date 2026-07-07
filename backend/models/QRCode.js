const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      default: '',
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRCode', qrCodeSchema);