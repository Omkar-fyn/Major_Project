const mongoose = require('mongoose');

const ownershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  tokensOwned: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  percentageOwned: {
    type: Number,
    default: 0
  },
  totalInvested: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-asset pairs
ownershipSchema.index({ user: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('Ownership', ownershipSchema);
