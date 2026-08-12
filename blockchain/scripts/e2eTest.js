import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const ammAddress = "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";
  
  // Impersonate the TRUE user (Shubham's MetaMask address)
  const userAddress = "0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3";
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [userAddress],
  });
  const userSigner = await hre.ethers.getSigner(userAddress);
  
  // Fund user with ETH
  await deployer.sendTransaction({ to: userAddress, value: hre.ethers.parseEther("1") });

  const BondingCurveAMM = await hre.ethers.getContractFactory("BondingCurveAMM");
  const amm = BondingCurveAMM.attach(ammAddress).connect(userSigner);
  
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const token = PropertyToken.attach(tokenAddress).connect(userSigner);
  
  // 1. Buy tokens (same as frontend: send 0.04 ETH for 40 tokens)
  console.log("Buying tokens via AMM...");
  const buyTx = await amm.buyTokens({ value: hre.ethers.parseEther("0.04") });
  const buyReceipt = await buyTx.wait();
  console.log(`✅ Buy tx hash: ${buyReceipt.hash}`);
  
  const balance = await token.balanceOf(userAddress);
  console.log(`On-chain token balance: ${hre.ethers.formatEther(balance)}`);
  
  // 2. Now simulate what the frontend does: call the backend /sync endpoint
  const http = await import('http');
  
  // First, we need a JWT token — login as Shubham
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'shubham@gmail.com', password: 'shubham' })
  });
  const loginData = await loginRes.json();
  
  if (!loginData.success) {
    console.log("⚠️ Login failed — need to know Shubham's credentials. Skipping sync test.");
    console.log("But the blockchain buy succeeded, so the event listener should catch it.");
    return;
  }
  
  const jwt = loginData.token;
  
  // Link wallet
  const linkRes = await fetch('http://localhost:5000/api/auth/link-wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
    body: JSON.stringify({ walletAddress: userAddress })
  });
  const linkData = await linkRes.json();
  console.log(`Link wallet: ${linkData.message}`);
  
  // Get first asset ID
  const assetsRes = await fetch('http://localhost:5000/api/assets');
  const assetsData = await assetsRes.json();
  const assetId = assetsData.assets[0]._id;
  
  // Sync
  const syncRes = await fetch('http://localhost:5000/api/transactions/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
    body: JSON.stringify({ 
      assetId: assetId, 
      tokenCount: Number(hre.ethers.formatEther(balance)),  // actual tokens received from AMM
      txHash: buyReceipt.hash, 
      type: 'buy' 
    })
  });
  const syncData = await syncRes.json();
  console.log(`Sync result: ${syncData.message}`);
  
  // Check portfolio
  const portfolioRes = await fetch('http://localhost:5000/api/transactions/portfolio', {
    headers: { 'Authorization': `Bearer ${jwt}` }
  });
  const portfolioData = await portfolioRes.json();
  console.log(`\n✅ Portfolio after buy:`);
  console.log(`   Total tokens: ${portfolioData.portfolio.totalTokens}`);
  console.log(`   Asset count: ${portfolioData.portfolio.assetCount}`);
  
  if (portfolioData.portfolio.totalTokens > 0) {
    console.log("\n🎉 END-TO-END TEST PASSED! Everything works.");
  } else {
    console.log("\n❌ TEST FAILED — tokens not showing in portfolio.");
  }
}

main().catch(console.error);
