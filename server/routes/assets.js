const express = require('express');
const router = express.Router();
const { getAssets, getAsset, createAsset } = require('../controllers/assetController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAssets);
router.get('/:id', getAsset);
router.post('/', protect, adminOnly, upload.single('image'), createAsset);

module.exports = router;
