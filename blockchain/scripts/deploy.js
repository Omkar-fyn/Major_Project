import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy PropertyToken
  console.log("Deploying PropertyToken...");
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    "Major Property Token", 
    "MPT", 
    hre.ethers.parseEther("1000000"), // Total Supply
    hre.ethers.parseEther("0.001"),   // Price per token
    "123 Main St, Mumbai, India"      // Property Address
  );
  await propertyToken.waitForDeployment();
  const tokenAddress = await propertyToken.getAddress();
  console.log("PropertyToken deployed to:", tokenAddress);

  // 2. Deploy BondingCurveAMM
  console.log("Deploying BondingCurveAMM...");
  const BondingCurveAMM = await hre.ethers.getContractFactory("BondingCurveAMM");
  const amm = await BondingCurveAMM.deploy(tokenAddress);
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  console.log("BondingCurveAMM deployed to:", ammAddress);

  // 3. Deploy OrderBookMarketplace
  console.log("Deploying OrderBookMarketplace...");
  const OrderBookMarketplace = await hre.ethers.getContractFactory("OrderBookMarketplace");
  const marketplace = await OrderBookMarketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("OrderBookMarketplace deployed to:", marketplaceAddress);

  // Setup initial liquidity for AMM
  console.log("Approving AMM to spend tokens...");
  await propertyToken.approve(ammAddress, hre.ethers.parseEther("1000"));
  
  console.log("Adding liquidity to AMM...");
  await amm.addLiquidity(hre.ethers.parseEther("1000"), { value: hre.ethers.parseEther("0.01") });
  console.log("Liquidity added: 1000 MPT & 0.01 ETH");
  
  console.log("\n=================================");
  console.log("Deployment Complete!");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_AMM_ADDRESS=${ammAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("=================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
