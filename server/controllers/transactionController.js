const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Ownership = require('../models/Ownership');
const { v4: uuidv4 } = require('uuid');

// @desc    Buy tokens
// @route   POST /api/transactions/buy
exports.buyTokens = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assetId, tokenCount } = req.body;
    const userId = req.user._id;

    if (!assetId || !tokenCount || tokenCount < 1) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid request. Provide assetId and tokenCount >= 1' });
    }

    // Fetch asset
    const asset = await Asset.findById(assetId).session(session);
    if (!asset) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Asset is not available for purchase' });
    }

    if (tokenCount > asset.availableTokens) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Only ${asset.availableTokens} tokens available`
      });
    }

    const totalCost = tokenCount * asset.pricePerToken;

    // Check user balance
    const user = await User.findById(userId).session(session);
    if (user.walletBalance < totalCost) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ₹${totalCost.toLocaleString()}, Available: ₹${user.walletBalance.toLocaleString()}`
      });
    }

    // Deduct user balance
    user.walletBalance -= totalCost;
    await user.save({ session });

    // Deduct available tokens
    asset.availableTokens -= tokenCount;
    if (asset.availableTokens === 0) {
      asset.status = 'sold-out';
    }
    await asset.save({ session });

    // Create or update ownership
    let ownership = await Ownership.findOne({ user: userId, asset: assetId }).session(session);
    if (ownership) {
      ownership.tokensOwned += tokenCount;
      ownership.totalInvested += totalCost;
      ownership.percentageOwned = ((ownership.tokensOwned / asset.totalTokens) * 100);
    } else {
      ownership = new Ownership({
        user: userId,
        asset: assetId,
        tokensOwned: tokenCount,
        totalInvested: totalCost,
        percentageOwned: ((tokenCount / asset.totalTokens) * 100)
      });
    }
    await ownership.save({ session });

    // Simulate blockchain tx hash
    const simulatedTxHash = `0x${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '').substring(0, 32)}`;

    // Create transaction record
    const transaction = await Transaction.create([{
      user: userId,
      asset: assetId,
      type: 'buy',
      tokensBought: tokenCount,
      pricePerToken: asset.pricePerToken,
      totalCost,
      blockchainTxHash: simulatedTxHash,
      status: 'completed'
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Transaction Successful',
      transaction: {
        id: transaction[0]._id,
        assetName: asset.name,
        tokensBought: tokenCount,
        pricePerToken: asset.pricePerToken,
        totalCost,
        txHash: simulatedTxHash,
        newBalance: user.walletBalance,
        tokensOwned: ownership.tokensOwned
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get user's transaction history
// @route   GET /api/transactions/my
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('asset', 'name image category pricePerToken')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's portfolio (owned assets)
// @route   GET /api/transactions/portfolio
exports.getPortfolio = async (req, res) => {
  try {
    const ownerships = await Ownership.find({ user: req.user._id })
      .populate('asset', 'name image category totalValue totalTokens pricePerToken status annualYield');

    const totalInvested = ownerships.reduce((sum, o) => sum + o.totalInvested, 0);
    const totalTokens = ownerships.reduce((sum, o) => sum + o.tokensOwned, 0);
    const currentValue = ownerships.reduce((sum, o) => {
      return sum + (o.tokensOwned * (o.asset ? o.asset.pricePerToken : 0));
    }, 0);

    res.json({
      success: true,
      portfolio: {
        totalInvested,
        currentValue,
        totalTokens,
        assetCount: ownerships.length,
        holdings: ownerships.map(o => ({
          asset: o.asset,
          tokensOwned: o.tokensOwned,
          percentageOwned: o.percentageOwned.toFixed(1),
          totalInvested: o.totalInvested,
          currentValue: o.tokensOwned * (o.asset ? o.asset.pricePerToken : 0)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
