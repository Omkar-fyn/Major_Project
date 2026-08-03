const Asset = require('../models/Asset');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Ownership = require('../models/Ownership');
const { v4: uuidv4 } = require('uuid');

// @desc    Buy tokens
// @route   POST /api/transactions/buy
exports.buyTokens = async (req, res) => {
  try {
    const { assetId, tokenCount } = req.body;
    const userId = req.user._id;

    if (!assetId || !tokenCount || tokenCount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid request. Provide assetId and tokenCount >= 1' });
    }

    // Fetch asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Asset is not available for purchase' });
    }

    if (tokenCount > asset.availableTokens) {
      return res.status(400).json({
        success: false,
        message: `Only ${asset.availableTokens} tokens available`
      });
    }

    const totalCost = tokenCount * asset.pricePerToken;

    // Check user balance
    const user = await User.findById(userId);
    if (user.walletBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ₹${totalCost.toLocaleString()}, Available: ₹${user.walletBalance.toLocaleString()}`
      });
    }

    // Deduct user balance
    user.walletBalance -= totalCost;
    await user.save();

    // Deduct available tokens
    asset.availableTokens -= tokenCount;
    if (asset.availableTokens === 0) {
      asset.status = 'sold-out';
    }
    await asset.save();

    // Create or update ownership
    let ownership = await Ownership.findOne({ user: userId, asset: assetId });
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
    await ownership.save();

    // Simulate blockchain tx hash
    const simulatedTxHash = `0x${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '').substring(0, 32)}`;

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      asset: assetId,
      type: 'buy',
      tokensBought: tokenCount,
      pricePerToken: asset.pricePerToken,
      totalCost,
      blockchainTxHash: simulatedTxHash,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction Successful',
      transaction: {
        id: transaction._id,
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sell tokens
// @route   POST /api/transactions/sell
exports.sellTokens = async (req, res) => {
  try {
    const { assetId, tokenCount } = req.body;
    const userId = req.user._id;

    if (!assetId || !tokenCount || tokenCount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid request. Provide assetId and tokenCount >= 1' });
    }

    // Fetch asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Check ownership
    const ownership = await Ownership.findOne({ user: userId, asset: assetId });
    if (!ownership || ownership.tokensOwned < tokenCount) {
      return res.status(400).json({
        success: false,
        message: `You only own ${ownership ? ownership.tokensOwned : 0} tokens of this asset`
      });
    }

    const totalValue = tokenCount * asset.pricePerToken;

    // Credit user balance
    const user = await User.findById(userId);
    user.walletBalance += totalValue;
    await user.save();

    // Return tokens to available pool
    asset.availableTokens += tokenCount;
    if (asset.status === 'sold-out' && asset.availableTokens > 0) {
      asset.status = 'active';
    }
    await asset.save();

    // Update ownership
    ownership.tokensOwned -= tokenCount;
    ownership.totalInvested -= totalValue;
    if (ownership.totalInvested < 0) ownership.totalInvested = 0;
    ownership.percentageOwned = ((ownership.tokensOwned / asset.totalTokens) * 100);

    if (ownership.tokensOwned === 0) {
      await ownership.deleteOne();
    } else {
      await ownership.save();
    }

    // Simulate blockchain tx hash
    const simulatedTxHash = `0x${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '').substring(0, 32)}`;

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      asset: assetId,
      type: 'sell',
      tokensBought: tokenCount,
      pricePerToken: asset.pricePerToken,
      totalCost: totalValue,
      blockchainTxHash: simulatedTxHash,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Sell Transaction Successful',
      transaction: {
        id: transaction._id,
        assetName: asset.name,
        tokensSold: tokenCount,
        pricePerToken: asset.pricePerToken,
        totalValue,
        txHash: simulatedTxHash,
        newBalance: user.walletBalance,
        tokensOwned: ownership.tokensOwned
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// @desc    Sync a real blockchain transaction
// @route   POST /api/transactions/sync
exports.syncBlockchainTx = async (req, res) => {
  try {
    const { assetId, tokenCount, txHash, type } = req.body;
    const userId = req.user._id;

    if (!assetId || !tokenCount || !txHash || !type) {
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const totalValue = tokenCount * asset.pricePerToken;
    const user = await User.findById(userId);

    let ownership = await Ownership.findOne({ user: userId, asset: assetId });

    if (type === 'buy') {
      asset.availableTokens -= tokenCount;
      if (asset.availableTokens <= 0) asset.status = 'sold-out';
      
      if (ownership) {
        ownership.tokensOwned += tokenCount;
        ownership.totalInvested += totalValue;
      } else {
        ownership = new Ownership({
          user: userId,
          asset: assetId,
          tokensOwned: tokenCount,
          totalInvested: totalValue,
          percentageOwned: 0
        });
      }
    } else if (type === 'sell') {
      asset.availableTokens += tokenCount;
      if (asset.status === 'sold-out' && asset.availableTokens > 0) asset.status = 'active';

      if (ownership) {
        ownership.tokensOwned -= tokenCount;
        ownership.totalInvested -= totalValue;
        if (ownership.totalInvested < 0) ownership.totalInvested = 0;
      }
    }

    if (ownership) {
      ownership.percentageOwned = ((ownership.tokensOwned / asset.totalTokens) * 100);
      if (ownership.tokensOwned <= 0) {
        await ownership.deleteOne();
      } else {
        await ownership.save();
      }
    }

    await asset.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      asset: assetId,
      type: type,
      tokensBought: tokenCount,
      pricePerToken: asset.pricePerToken,
      totalCost: totalValue,
      blockchainTxHash: txHash,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Blockchain Transaction Synced',
      transaction: {
        id: transaction._id,
        assetName: asset.name,
        tokensBought: tokenCount,
        txHash: txHash,
        newBalance: user.walletBalance,
        tokensOwned: ownership ? ownership.tokensOwned : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
