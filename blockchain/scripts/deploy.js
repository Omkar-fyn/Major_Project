import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1 & 2. Use Already Deployed Contracts to save gas!
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const ammAddress = "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";
  
  const propertyToken = await hre.ethers.getContractAt("PropertyToken", tokenAddress);
  const amm = await hre.ethers.getContractAt("BondingCurveAMM", ammAddress);
  
  console.log("Using deployed PropertyToken at:", tokenAddress);
  console.log("Using deployed BondingCurveAMM at:", ammAddress);

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
  // Changed from 10 ETH to 0.01 ETH because of faucet limits!
  await amm.addLiquidity(hre.ethers.parseEther("1000"), { value: hre.ethers.parseEther("0.01") });
  console.log("Liquidity added: 1000 MPT & 0.01 MATIC");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
