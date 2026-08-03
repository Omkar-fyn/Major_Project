const express = require('express');
const router = express.Router();
const { getAssets, getAsset, createAsset, getAssetChartData } = require('../controllers/assetController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAssets);
// Chart route MUST be before /:id to avoid :id matching "chart-related" paths
router.get('/:id/chart', getAssetChartData);
router.get('/:id', getAsset);
router.post('/', protect, adminOnly, upload.single('image'), createAsset);

module.exports = router;
