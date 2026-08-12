const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Transaction = require('./models/Transaction');
const Ownership = require('./models/Ownership');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    console.log('=== CLEANUP: Wiping all corrupted data ===\n');

    // 1. Delete all transactions
    const txCount = await Transaction.countDocuments();
    await Transaction.deleteMany({});
    console.log(`✅ Deleted ${txCount} transactions`);

    // 2. Delete all ownerships
    const ownCount = await Ownership.countDocuments();
    await Ownership.deleteMany({});
    console.log(`✅ Deleted ${ownCount} ownerships`);

    // 3. Reset all assets: availableTokens = totalTokens, status = active
    const assets = await Asset.find();
    for (const asset of assets) {
      asset.availableTokens = asset.totalTokens;
      asset.status = 'active';
      await asset.save();
      console.log(`✅ Reset asset "${asset.name}": ${asset.totalTokens} tokens available`);
    }

    // 4. Reset all user wallet balances to 100000, clear fake wallet IDs
    const users = await User.find();
    for (const user of users) {
      user.walletBalance = 100000;
      // Don't touch walletId — it will be properly set when they connect MetaMask
      await user.save();
      console.log(`✅ Reset user "${user.name}": balance = ₹1,00,000, wallet = ${user.walletId}`);
    }

    console.log('\n=== CLEANUP COMPLETE ===');
    console.log('All data is now clean. Users can start fresh.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  });
