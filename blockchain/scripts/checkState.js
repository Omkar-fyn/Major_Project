import hre from "hardhat";

async function main() {
  const ammAddress = "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";
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
