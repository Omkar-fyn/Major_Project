import hre from "hardhat";

async function main() {
  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const userAddress = "0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3";
  
  const token = await hre.ethers.getContractAt("PropertyToken", tokenAddress);
  const balance = await token.balanceOf(userAddress);
  
  console.log(`User balance on chain: ${hre.ethers.formatEther(balance)}`);
}

main().catch(console.error);
