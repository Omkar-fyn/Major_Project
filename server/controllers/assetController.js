const Asset = require('../models/Asset');
const Ownership = require('../models/Ownership');

// In-memory price history cache (simulated live market data)
// Key: assetId, Value: { prices: [], timestamps: [], lastUpdate: Date }
const priceCache = {};

function getAMMPrice(asset) {
  // Constant Product Formula: x * y = k
  if (!asset.availableTokens || asset.availableTokens === 0) return asset.pricePerToken * 5; // Arbitrary cap
  
  const initialY = asset.totalTokens;
  const initialX = asset.totalTokens * asset.pricePerToken;
  const k = initialX * initialY;
  
  const currentY = asset.availableTokens;
  const currentX = k / currentY;
  
  // price = x / y
  const currentPrice = currentX / currentY;
  return Math.round(currentPrice * 100) / 100;
}

/**
 * Generate simulated price variation around a base price.
 * Applies ±1% random fluctuation for visual charting.
 */
function simulatePrice(basePrice) {
  const variationPercent = (Math.random() * 2 - 1) / 100; 
  return Math.round(basePrice * (1 + variationPercent) * 100) / 100;
}

/**
 * Get or create price history for an asset using AMM logic.
 */
function getOrCreatePriceHistory(asset) {
  const now = Date.now();
  const assetId = asset._id.toString();
  const ammPrice = getAMMPrice(asset);
  
  if (!priceCache[assetId]) {
    const prices = [];
    const timestamps = [];
    // Generate 100 historical data points for a dense, real-looking chart
    for (let i = 99; i >= 0; i--) {
      prices.push(simulatePrice(ammPrice));
      timestamps.push(new Date(now - i * 3000).toISOString());
    }
    priceCache[assetId] = { prices, timestamps, lastUpdate: now, basePrice: ammPrice };
  }
  
  const cache = priceCache[assetId];
  cache.basePrice = ammPrice;
  
  const elapsed = now - cache.lastUpdate;
  const newPoints = Math.min(Math.floor(elapsed / 3000), 5);
  
  for (let i = 0; i < newPoints; i++) {
    cache.prices.push(simulatePrice(ammPrice));
    cache.timestamps.push(new Date(now - (newPoints - 1 - i) * 3000).toISOString());
  }
  
  if (newPoints > 0) {
    cache.lastUpdate = now;
  }
  
  if (cache.prices.length > 100) {
    cache.prices = cache.prices.slice(-100);
    cache.timestamps = cache.timestamps.slice(-100);
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

    const formattedAssets = assets.map(a => {
      const doc = a.toObject();
      doc.pricePerToken = a.getCurrentPrice();
      return doc;
    });

    res.json({ success: true, count: formattedAssets.length, assets: formattedAssets });
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

    const doc = asset.toObject();
    doc.pricePerToken = asset.getCurrentPrice();

    res.json({
      success: true,
      asset: doc,
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

    const history = getOrCreatePriceHistory(asset);

    res.json({
      success: true,
      priceHistory: history.prices,
      timestamps: history.timestamps,
      tokenDistribution: {
        total: asset.totalTokens,
        sold: asset.totalTokens - asset.availableTokens,
        available: asset.availableTokens
      },
      basePrice: history.basePrice
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
