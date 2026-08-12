const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User'); // Required for population
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    const txs = await Transaction.find().sort({ createdAt: -1 }).limit(5).populate('user');
    txs.forEach(tx => {
      console.log(`User: ${tx.user ? tx.user.name : 'Unknown'} | Type: ${tx.type} | Tokens: ${tx.tokensSold || tx.tokensBought} | Hash: ${tx.blockchainTxHash}`);
    });
    process.exit(0);
  });
