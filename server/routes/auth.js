const express = require('express');
const router = express.Router();
const { signup, login, getMe, linkWallet } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/link-wallet', protect, linkWallet);

module.exports = router;
