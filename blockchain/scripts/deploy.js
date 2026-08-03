import hardhat from "hardhat";

async function main() {
  const [deployer] = await hardhat.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PropertyToken
  const PropertyToken = await hardhat.ethers.getContractFactory("PropertyToken");
  const totalSupply = hardhat.ethers.parseEther("1000000"); // 1 million tokens
  const pricePerToken = hardhat.ethers.parseEther("0.01"); // 0.01 ETH per token
  const propertyAddress = "123 Blockchain Ave, Crypto City";
  
  const propertyToken = await PropertyToken.deploy("RealEstateToken", "RET", totalSupply, pricePerToken, propertyAddress);
  await propertyToken.waitForDeployment();
  const tokenAddress = await propertyToken.getAddress();
  console.log("PropertyToken deployed to:", tokenAddress);

  // Deploy OrderBookMarketplace
  const OrderBookMarketplace = await hardhat.ethers.getContractFactory("OrderBookMarketplace");
  const orderBook = await OrderBookMarketplace.deploy(tokenAddress);
  await orderBook.waitForDeployment();
  const orderBookAddress = await orderBook.getAddress();
  console.log("OrderBookMarketplace deployed to:", orderBookAddress);

  // Deploy BondingCurveAMM
  const BondingCurveAMM = await hardhat.ethers.getContractFactory("BondingCurveAMM");
  const bondingCurve = await BondingCurveAMM.deploy(tokenAddress);
  await bondingCurve.waitForDeployment();
  const bondingCurveAddress = await bondingCurve.getAddress();
  console.log("BondingCurveAMM deployed to:", bondingCurveAddress);
  
  console.log("-----------------------------------------");
  console.log("✅ Deployment successful!");
  console.log("PropertyToken:", tokenAddress);
  console.log("OrderBookMarketplace:", orderBookAddress);
  console.log("BondingCurveAMM:", bondingCurveAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
