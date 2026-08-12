const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asset-tokenization')
  .then(async () => {
    const users = await User.find({});
    users.forEach(u => console.log(`${u.name}: ${u.walletId}`));
    process.exit(0);
  });
