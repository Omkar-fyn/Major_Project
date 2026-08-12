const mongoose = require('mongoose');
const User = require('./models/User');
const Ownership = require('./models/Ownership');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const TRUE_ADDRESS = '0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    const user = await User.findOne({ walletId: TRUE_ADDRESS });
    if (!user) {
      console.log('User not found in DB!');
      process.exit(1);
    }
    
    const ownerships = await Ownership.find({ user: user._id });
    console.log(`User ${user.name} owns:`);
    ownerships.forEach(o => console.log(`- Asset ${o.asset}: ${o.tokensOwned} tokens`));
    
    const txs = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
    if (txs.length > 0) {
      console.log(`Latest transaction: ${txs[0].type} ${txs[0].tokensSold || txs[0].tokensBought} tokens. Hash: ${txs[0].blockchainTxHash}`);
    } else {
      console.log('No transactions found.');
    }
    
    process.exit(0);
  });
