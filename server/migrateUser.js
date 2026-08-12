const mongoose = require('mongoose');
const User = require('./models/User');
const Ownership = require('./models/Ownership');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const TRUE_ADDRESS = '0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    const omkar = await User.findOne({ name: 'omkar bharath' });
    const shubham = await User.findOne({ name: 'Shubham Bharath Pukale' });

    if (omkar && shubham) {
      console.log('Migrating data from omkar to shubham...');
      
      // 1. Give omkar a random wallet ID so it frees up the TRUE_ADDRESS
      omkar.walletId = `0x${require('crypto').randomBytes(20).toString('hex')}`;
      await omkar.save();
      
      // 2. Give shubham the TRUE_ADDRESS
      shubham.walletId = TRUE_ADDRESS;
      await shubham.save();
      
      // 3. Migrate ownership records
      await Ownership.updateMany({ user: omkar._id }, { $set: { user: shubham._id } });
      
      // 4. Migrate transactions
      await Transaction.updateMany({ user: omkar._id }, { $set: { user: shubham._id } });
      
      console.log('Successfully migrated! Shubham should now see everything.');
    } else {
      console.log('Could not find one of the users!');
    }
    
    process.exit(0);
  });
