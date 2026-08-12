const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

mongoose.connect('mongodb://127.0.0.1:27017/asset-tokenization', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const txs = await Transaction.find().sort({ createdAt: -1 }).limit(10).populate('user');
  txs.forEach(tx => {
    console.log(`Type: ${tx.type}, tokensBought: ${tx.tokensBought}, tokensSold: ${tx.tokensSold}, User: ${tx.user.name}`);
  });
  process.exit(0);
});
