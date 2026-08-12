import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy PropertyToken
  const initialSupply = hre.ethers.parseEther("1000"); // 1,000 tokens for AMM liquidity
  const pricePerToken = hre.ethers.parseEther("0.1"); // 0.1 ETH
  
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    "Major Property", 
    "MPT", 
    initialSupply, 
    pricePerToken, 
    "123 Main St"
  );
  await propertyToken.waitForDeployment();
  const tokenAddress = await propertyToken.getAddress();
  console.log("PropertyToken deployed to:", tokenAddress);

  // 2. Deploy BondingCurveAMM
  const BondingCurveAMM = await hre.ethers.getContractFactory("BondingCurveAMM");
  const amm = await BondingCurveAMM.deploy(tokenAddress);
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  console.log("BondingCurveAMM deployed to:", ammAddress);

  // 3. Deploy OrderBookMarketplace
  const OrderBookMarketplace = await hre.ethers.getContractFactory("OrderBookMarketplace");
  const marketplace = await OrderBookMarketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("OrderBookMarketplace deployed to:", marketplaceAddress);

  // Setup initial liquidity for AMM
  console.log("Approving AMM to spend tokens...");
  await propertyToken.approve(ammAddress, hre.ethers.parseEther("1000"));
  
  console.log("Adding liquidity to AMM...");
  await amm.addLiquidity(hre.ethers.parseEther("1000"), { value: hre.ethers.parseEther("10") });
  console.log("Liquidity added: 1000 MPT & 10 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
