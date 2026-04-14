const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Asset description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['real-estate', 'gold', 'vehicle', 'commodity', 'art', 'other'],
    default: 'other'
  },
  image: {
    type: String,
    default: null
  },
  totalValue: {
    type: Number,
    required: [true, 'Total asset value is required'],
    min: 0
  },
  totalTokens: {
    type: Number,
    required: [true, 'Total tokens is required'],
    min: 1
  },
  availableTokens: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerToken: {
    type: Number,
    required: true,
    min: 0
  },
  contractAddress: {
    type: String,
    default: null // Placeholder for future smart contract address
  },
  blockchainNetwork: {
    type: String,
    default: 'ethereum-simulated' // Placeholder
  },
  status: {
    type: String,
    enum: ['active', 'sold-out', 'delisted'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
    default: null
  },
  annualYield: {
    type: Number,
    default: 0 // Percentage
  }
}, {
  timestamps: true
});

// Auto-compute pricePerToken before save
assetSchema.pre('save', function(next) {
  if (this.totalValue && this.totalTokens) {
    this.pricePerToken = Math.round((this.totalValue / this.totalTokens) * 100) / 100;
  }
  if (this.availableTokens === 0) {
    this.status = 'sold-out';
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
