const express = require('express');
const router = express.Router();
const { buyTokens, getMyTransactions, getPortfolio } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.post('/buy', protect, buyTokens);
router.get('/my', protect, getMyTransactions);
router.get('/portfolio', protect, getPortfolio);

module.exports = router;
