const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const TRUE_ADDRESS = '0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    const user = await User.findOne({ name: 'omkar bharath' });
    if (user) {
      console.log(`Updating omkar bharath wallet to ${TRUE_ADDRESS}`);
      user.walletId = TRUE_ADDRESS;
      await user.save();
    }
    process.exit(0);
  });
