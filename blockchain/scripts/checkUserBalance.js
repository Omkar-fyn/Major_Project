import hre from "hardhat";

async function main() {
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const userAddress = "0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3";
  
  const token = await hre.ethers.getContractAt("PropertyToken", tokenAddress);
  const balance = await token.balanceOf(userAddress);
  
  console.log(`User balance on chain: ${hre.ethers.formatEther(balance)}`);
}

main().catch(console.error);
