const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

router.post('/', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address required' });
    }

    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Hardhat default account #0 private key
    const deployerPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const deployer = new ethers.Wallet(deployerPrivateKey, provider);

    const tx = await deployer.sendTransaction({
      to: address,
      value: ethers.parseEther("100.0")
    });
    await tx.wait();

    res.json({ success: true, message: `Funded ${address} with 100 ETH!` });
  } catch (error) {
    console.error("Faucet error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
