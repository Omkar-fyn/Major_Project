const Asset = require('../models/Asset');
const Ownership = require('../models/Ownership');

// @desc    Get all active assets
// @route   GET /api/assets
exports.getAssets = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    let query = { status: { $ne: 'delisted' } };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { pricePerToken: 1 };
    if (sort === 'price-high') sortOption = { pricePerToken: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const assets = await Asset.find(query).sort(sortOption);

    res.json({ success: true, count: assets.length, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single asset with ownership info
// @route   GET /api/assets/:id
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Get ownership distribution
    const owners = await Ownership.find({ asset: req.params.id })
      .populate('user', 'name walletId')
      .sort({ tokensOwned: -1 })
      .limit(10);

    const totalOwnedTokens = asset.totalTokens - asset.availableTokens;

    res.json({
      success: true,
      asset,
      ownership: {
        totalOwners: owners.length,
        totalOwnedTokens,
        percentageSold: ((totalOwnedTokens / asset.totalTokens) * 100).toFixed(1),
        topHolders: owners.map(o => ({
          name: o.user.name,
          walletId: o.user.walletId,
          tokensOwned: o.tokensOwned,
          percentage: ((o.tokensOwned / asset.totalTokens) * 100).toFixed(1)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create asset (admin)
// @route   POST /api/assets
exports.createAsset = async (req, res) => {
  try {
    const { name, description, category, totalValue, totalTokens, location, annualYield } = req.body;

    const pricePerToken = Math.round((totalValue / totalTokens) * 100) / 100;

    const assetData = {
      name,
      description,
      category,
      totalValue: Number(totalValue),
      totalTokens: Number(totalTokens),
      availableTokens: Number(totalTokens),
      pricePerToken,
      location,
      annualYield: Number(annualYield) || 0,
      createdBy: req.user._id
    };

    if (req.file) {
      assetData.image = `/uploads/${req.file.filename}`;
    }

    const asset = await Asset.create(assetData);

    res.status(201).json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
