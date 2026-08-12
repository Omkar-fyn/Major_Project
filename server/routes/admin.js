const express = require('express');
const router = express.Router();
const { getAllUsers, getAllTransactions, getStats, getBlockchainStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/stats', getStats);
router.get('/blockchain', getBlockchainStats);

module.exports = router;
