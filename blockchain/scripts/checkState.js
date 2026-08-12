import hre from "hardhat";

async function main() {
  const ammAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const AMM = await hre.ethers.getContractAt("BondingCurveAMM", ammAddress);
  
  const reserveETH = await AMM.reserveETH();
  const reserveToken = await AMM.reserveToken();
  const tokenAddress = await AMM.propertyToken();

  console.log("AMM reserveETH:", hre.ethers.formatEther(reserveETH));
  console.log("AMM reserveToken:", hre.ethers.formatEther(reserveToken));
  console.log("AMM propertyToken:", tokenAddress);
  
  const token = await hre.ethers.getContractAt("PropertyToken", tokenAddress);
  const ammBal = await token.balanceOf(ammAddress);
  console.log("AMM actual token balance:", hre.ethers.formatEther(ammBal));
}

main().catch(console.error);
