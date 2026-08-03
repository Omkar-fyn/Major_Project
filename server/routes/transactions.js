const express = require('express');
const router = express.Router();
const { buyTokens, sellTokens, getMyTransactions, getPortfolio, syncBlockchainTx } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.post('/buy', protect, buyTokens);
router.post('/sell', protect, sellTokens);
router.post('/sync', protect, syncBlockchainTx);
router.get('/my', protect, getMyTransactions);
router.get('/portfolio', protect, getPortfolio);

module.exports = router;
