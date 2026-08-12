const Asset = require('../models/Asset');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Ownership = require('../models/Ownership');
const { v4: uuidv4 } = require('uuid');
const { ethers } = require('ethers');

// Helper to get blockchain contract
const getBlockchainContract = () => {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  // Default hardhat account #0 private key for prototype
  const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(
    TOKEN_ADDRESS,
    ['function mint(address to, uint256 amount) external', 'function burn(address from, uint256 amount) external'],
    wallet
  );
};
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

    const dynamicPrice = asset.getCurrentPrice();
    const totalCost = tokenCount * dynamicPrice;

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

    // Execute actual blockchain mint transaction
    let actualTxHash;
    try {
      const tokenContract = getBlockchainContract();
      // Mint tokens to the user's walletId
      const tx = await tokenContract.mint(user.walletId, ethers.parseEther(tokenCount.toString()));
      await tx.wait(); // Wait for confirmation
      actualTxHash = tx.hash;
    } catch (blockchainError) {
      console.error("Blockchain mint failed:", blockchainError);
      return res.status(500).json({ success: false, message: 'Blockchain transaction failed' });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      asset: assetId,
      type: 'buy',
      tokensBought: tokenCount,
      pricePerToken: dynamicPrice,
      totalCost,
      blockchainTxHash: actualTxHash,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction Successful',
      transaction: {
        id: transaction._id,
        assetName: asset.name,
        tokensBought: tokenCount,
        pricePerToken: dynamicPrice,
        totalCost,
        txHash: actualTxHash,
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

    const dynamicPrice = asset.getCurrentPrice();
    const totalValue = tokenCount * dynamicPrice;

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

    // Execute actual blockchain burn transaction
    let actualTxHash;
    try {
      const tokenContract = getBlockchainContract();
      // Burn tokens from the user's walletId
      const tx = await tokenContract.burn(user.walletId, ethers.parseEther(tokenCount.toString()));
      await tx.wait(); // Wait for confirmation
      actualTxHash = tx.hash;
    } catch (blockchainError) {
      console.error("Blockchain burn failed:", blockchainError);
      return res.status(500).json({ success: false, message: 'Blockchain transaction failed' });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      asset: assetId,
      type: 'sell',
      tokensSold: tokenCount,
      pricePerToken: dynamicPrice,
      totalCost: totalValue,
      blockchainTxHash: actualTxHash,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Sell Transaction Successful',
      transaction: {
        id: transaction._id,
        assetName: asset.name,
        tokensSold: tokenCount,
        pricePerToken: dynamicPrice,
        totalValue,
        txHash: actualTxHash,
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

    // Verify transaction exists and is successful on the blockchain
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545'; // fallback to local hardhat
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    let receipt;
    try {
      receipt = await provider.getTransactionReceipt(txHash);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid transaction hash format' });
    }

    if (!receipt) {
      return res.status(400).json({ success: false, message: 'Transaction not found on the network' });
    }

    if (receipt.status !== 1) {
      return res.status(400).json({ success: false, message: 'Transaction failed on the network' });
    }

    // Check if we already synced this txHash — return success (not error) for idempotency
    const existingTx = await Transaction.findOne({ blockchainTxHash: txHash });
    if (existingTx) {
      return res.json({ success: true, message: 'Transaction already synced', transaction: existingTx });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const dynamicPrice = asset.getCurrentPrice();
    const totalValue = tokenCount * dynamicPrice;
    const user = await User.findById(userId);

    let ownership = await Ownership.findOne({ user: userId, asset: assetId });

    if (type === 'buy') {
      // Deduct balance
      user.walletBalance -= totalValue;

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
      if (!ownership || ownership.tokensOwned < tokenCount) {
        return res.status(400).json({ success: false, message: 'Insufficient tokens in portfolio to sell' });
      }

      // Credit balance
      user.walletBalance += totalValue;

      asset.availableTokens += tokenCount;
      if (asset.status === 'sold-out' && asset.availableTokens > 0) asset.status = 'active';

      if (ownership) {
        ownership.tokensOwned -= tokenCount;
        ownership.totalInvested -= totalValue;
        if (ownership.totalInvested < 0) ownership.totalInvested = 0;
      }
    }

    await user.save();

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
      tokensBought: type === 'buy' ? tokenCount : undefined,
      tokensSold: type === 'sell' ? tokenCount : undefined,
      pricePerToken: dynamicPrice,
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
