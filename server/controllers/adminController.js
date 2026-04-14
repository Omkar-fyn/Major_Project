const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Ownership = require('../models/Ownership');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all transactions (admin)
// @route   GET /api/admin/transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email walletId')
      .populate('asset', 'name category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform stats (admin)
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAssets = await Asset.countDocuments();
    const activeAssets = await Asset.countDocuments({ status: 'active' });
    const totalTransactions = await Transaction.countDocuments();

    const volumeResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalVolume: { $sum: '$totalCost' } } }
    ]);

    const totalVolume = volumeResult.length > 0 ? volumeResult[0].totalVolume : 0;

    const recentTransactions = await Transaction.find()
      .populate('user', 'name')
      .populate('asset', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAssets,
        activeAssets,
        totalTransactions,
        totalVolume,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
