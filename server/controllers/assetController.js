const Asset = require('../models/Asset');
const Ownership = require('../models/Ownership');

// In-memory price history cache (simulated live market data)
// Key: assetId, Value: { prices: [], timestamps: [], lastUpdate: Date }
const priceCache = {};

/**
 * Generate simulated price variation from base price.
 * Applies ±2% to ±5% random fluctuation.
 */
function simulatePrice(basePrice) {
  const variationPercent = (Math.random() * 6 - 3) / 100; // -3% to +3%
  const trendBias = (Math.random() - 0.48) * 0.02; // slight upward bias
  return Math.round(basePrice * (1 + variationPercent + trendBias) * 100) / 100;
}

/**
 * Get or create price history for an asset.
 * Maintains a sliding window of 20 data points.
 */
function getOrCreatePriceHistory(assetId, basePrice) {
  const now = Date.now();
  
  if (!priceCache[assetId]) {
    // Initialize with 20 historical data points (simulated past)
    const prices = [];
    const timestamps = [];
    for (let i = 19; i >= 0; i--) {
      prices.push(simulatePrice(basePrice));
      timestamps.push(new Date(now - i * 3000).toISOString());
    }
    priceCache[assetId] = { prices, timestamps, lastUpdate: now, basePrice };
  }
  
  const cache = priceCache[assetId];
  
  // Update base price if it changed (token was bought/sold)
  cache.basePrice = basePrice;
  
  // Add new data points for elapsed time since last update
  const elapsed = now - cache.lastUpdate;
  const newPoints = Math.min(Math.floor(elapsed / 3000), 5); // max 5 new points per request
  
  for (let i = 0; i < newPoints; i++) {
    cache.prices.push(simulatePrice(basePrice));
    cache.timestamps.push(new Date(now - (newPoints - 1 - i) * 3000).toISOString());
  }
  
  if (newPoints > 0) {
    cache.lastUpdate = now;
  }
  
  // Keep only last 20 data points (sliding window)
  if (cache.prices.length > 20) {
    cache.prices = cache.prices.slice(-20);
    cache.timestamps = cache.timestamps.slice(-20);
  }
  
  return cache;
}

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

// @desc    Get chart data for an asset (price simulation + token distribution)
// @route   GET /api/assets/:id/chart
exports.getAssetChartData = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const history = getOrCreatePriceHistory(req.params.id, asset.pricePerToken);

    res.json({
      success: true,
      priceHistory: history.prices,
      timestamps: history.timestamps,
      tokenDistribution: {
        total: asset.totalTokens,
        sold: asset.totalTokens - asset.availableTokens,
        available: asset.availableTokens
      },
      basePrice: asset.pricePerToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create asset (admin)
// @route   POST /api/assets
exports.createAsset = async (req, res) => {
  try {
    const { name, description, category, totalValue, totalTokens, location, annualYield, propertyAddress, builtUpArea, expectedRentalYield, spvCompanyName, legalDocumentUrl } = req.body;

    const assetData = {
      name,
      description,
      category,
      propertyAddress,
      totalValue: Number(totalValue),
      totalTokens: Number(totalTokens),
      availableTokens: Number(totalTokens),
      location,
      annualYield: Number(annualYield) || 0,
      builtUpArea,
      expectedRentalYield: expectedRentalYield ? Number(expectedRentalYield) : undefined,
      spvCompanyName,
      legalDocumentUrl,
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
