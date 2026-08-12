const { ethers } = require('ethers');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Ownership = require('../models/Ownership');

let rpcUrl = process.env.RPC_URL || 'ws://127.0.0.1:8545';
if (rpcUrl.includes('polygon') || rpcUrl.includes('amoy')) {
  rpcUrl = 'https://sepolia.infura.io/v3/f0b4969d86e74233a4f94b8e73c0e947';
}
const AMM_ADDRESS = process.env.AMM_ADDRESS || "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa"; 
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";

const AMM_ABI = [
  "event TokensSwapped(address indexed user, uint256 ethIn, uint256 tokenIn, uint256 ethOut, uint256 tokenOut)"
];

let provider;
let ammContract;

async function startBlockchainListener() {
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`📡 Connected to blockchain network: ${network.chainId}`);

    ammContract = new ethers.Contract(AMM_ADDRESS, AMM_ABI, provider);

    // Listen for TokensSwapped events
    ammContract.on("TokensSwapped", async (userAddress, ethIn, tokenIn, ethOut, tokenOut, event) => {
      console.log(`\n🔔 [BLOCKCHAIN EVENT] TokensSwapped detected! Tx: ${event.log.transactionHash}`);
      
      try {
        const txHash = event.log.transactionHash;

        // Check if we already processed this tx to prevent duplicates
        const existingTx = await Transaction.findOne({ blockchainTxHash: txHash });
        if (existingTx) {
          console.log(`⚠️ Transaction ${txHash} already processed.`);
          return;
        }

        // Find the user by wallet address
        const user = await User.findOne({ walletId: { $regex: new RegExp(`^${userAddress}$`, 'i') } });
        if (!user) {
          console.error(`❌ User not found for wallet: ${userAddress}`);
          return;
        }

        // Find the first asset (we only have one hardcoded for now, but usually we would use an asset factory mapping)
        const asset = await Asset.findOne({ status: { $ne: 'delisted' } });
        if (!asset) {
          console.error(`❌ No active asset found.`);
          return;
        }

        const isBuy = ethIn > 0;
        const tokenCountParsed = isBuy ? Number(ethers.formatEther(tokenOut)) : Number(ethers.formatEther(tokenIn));
        const dynamicPrice = asset.getCurrentPrice();
        const totalValue = tokenCountParsed * dynamicPrice;

        let ownership = await Ownership.findOne({ user: user._id, asset: asset._id });

        if (isBuy) {
          // Deduct fiat balance (if applicable in this hybrid model)
          user.walletBalance -= totalValue;
          
          asset.availableTokens -= tokenCountParsed;
          if (asset.availableTokens <= 0) asset.status = 'sold-out';

          if (ownership) {
            ownership.tokensOwned += tokenCountParsed;
            ownership.totalInvested += totalValue;
          } else {
            ownership = new Ownership({
              user: user._id,
              asset: asset._id,
              tokensOwned: tokenCountParsed,
              totalInvested: totalValue,
              percentageOwned: 0
            });
          }
        } else {
          // Sell logic
          user.walletBalance += totalValue;

          asset.availableTokens += tokenCountParsed;
          if (asset.status === 'sold-out' && asset.availableTokens > 0) asset.status = 'active';

          if (ownership) {
            ownership.tokensOwned -= tokenCountParsed;
            ownership.totalInvested -= totalValue;
            if (ownership.totalInvested < 0) ownership.totalInvested = 0;
          }
        }

        await user.save();
        await asset.save();
        
        if (ownership) {
          ownership.percentageOwned = ((ownership.tokensOwned / asset.totalTokens) * 100);
          if (ownership.tokensOwned <= 0) {
            await ownership.deleteOne();
          } else {
            await ownership.save();
          }
        }

        // Record transaction
        await Transaction.create({
          user: user._id,
          asset: asset._id,
          type: isBuy ? 'buy' : 'sell',
          tokensBought: isBuy ? tokenCountParsed : undefined,
          tokensSold: !isBuy ? tokenCountParsed : undefined,
          pricePerToken: dynamicPrice,
          totalCost: totalValue,
          blockchainTxHash: txHash,
          status: 'completed'
        });

        console.log(`✅ [SYNC SUCCESS] Automatically synced ${isBuy ? 'BUY' : 'SELL'} of ${tokenCountParsed} tokens for ${user.name}`);

      } catch (err) {
        console.error("❌ Error processing blockchain event:", err);
      }
    });

    console.log(`🎧 Listening for AMM events on ${AMM_ADDRESS}...`);

  } catch (error) {
    console.error("❌ Failed to start blockchain listener:", error.message);
  }
}

// Function to check if local hardhat node wiped and clear DB if necessary
async function checkAndSyncLocalNetworkWipe() {
  try {
    const checkProvider = new ethers.JsonRpcProvider(rpcUrl);
    // Check if the contract is deployed at AMM_ADDRESS
    const code = await checkProvider.getCode(AMM_ADDRESS);
    
    if (code === '0x' && rpcUrl.includes('127.0.0.1')) {
      console.log(`⚠️ [NETWORK DETECT] AMM Contract not found at ${AMM_ADDRESS}!`);
      console.log(`⚠️ This usually means the local Hardhat node was restarted.`);
      console.log(`🔄 Automatically wiping local database transactions and ownerships to stay in sync...`);
      
      await Transaction.deleteMany({});
      await Ownership.deleteMany({});
      
      // Reset asset available tokens
      const assets = await Asset.find();
      for (let asset of assets) {
        asset.availableTokens = asset.totalTokens;
        asset.status = 'active';
        await asset.save();
      }
      
      console.log(`✅ Database perfectly synced with wiped blockchain state.`);
    }
  } catch (err) {
    console.log(`ℹ️ Cannot connect to Hardhat node yet, skipping network wipe check.`);
  }
}

module.exports = { startBlockchainListener, checkAndSyncLocalNetworkWipe };
