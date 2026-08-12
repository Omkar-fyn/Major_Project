const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['buy', 'sell'],
    default: 'buy'
  },
  tokensBought: {
    type: Number,
    required: false,
    min: 1
  },
  tokensSold: {
    type: Number,
    required: false,
    min: 1
  },
  pricePerToken: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  blockchainTxHash: {
    type: String,
    default: null // Placeholder for future blockchain tx hash
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
