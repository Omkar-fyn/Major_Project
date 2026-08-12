const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Ownership = require('../models/Ownership');
const { ethers } = require('ethers');

// Ensure correct contract addresses for proxying
const AMM_ADDRESS = process.env.AMM_ADDRESS || "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

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
    const totalUsers = await User.countDocuments();
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

// @desc    Get live blockchain stats (admin proxy)
// @route   GET /api/admin/blockchain
exports.getBlockchainStats = async (req, res) => {
  try {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const blockNumber = await provider.getBlockNumber();
    
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ['function totalSupply() view returns(uint256)'], provider);
    const ammContract = new ethers.Contract(AMM_ADDRESS, ['function reserveETH() view returns(uint256)', 'function reserveToken() view returns(uint256)'], provider);
    
    const totalSupply = await tokenContract.totalSupply();
    const reserveETH = await ammContract.reserveETH();
    const reserveToken = await ammContract.reserveToken();
    
    // Total supply minus what is locked in the AMM gives us the exact amount minted/bought by users
    const userTokensMinted = totalSupply - reserveToken;

    res.json({
      success: true,
      blockchain: {
        blockNumber,
        totalSupply: ethers.formatEther(totalSupply),
        userTokensMinted: ethers.formatEther(userTokensMinted),
        ammEth: ethers.formatEther(reserveETH),
        ammTokens: ethers.formatEther(reserveToken),
        status: 'Connected (Proxy via Node.js)'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
