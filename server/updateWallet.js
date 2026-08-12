const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    // 1. Update omkar bharath's wallet address to the one in MetaMask
    const user = await User.findOne({ name: 'omkar bharath' });
    if (user) {
      console.log(`Found user ${user.name}. Changing wallet from ${user.walletId} to 0x20D0835F5eBbBE67AfF4B4a2Ba59C03B8794bcB3...`);
      user.walletId = '0x20D0835F5eBbBE67AfF4B4a2Ba59C03B8794bcB3';
      await user.save();
      console.log('Wallet updated successfully!');
    } else {
      console.log('User omkar bharath not found.');
    }
    process.exit(0);
  });
