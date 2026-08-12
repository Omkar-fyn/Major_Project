import hre from "hardhat";

async function main() {
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const trueUserAddress = "0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3";
  
  const token = await hre.ethers.getContractAt("PropertyToken", tokenAddress);
  
  // Mint 100 tokens to the TRUE address
  const amountToMint = hre.ethers.parseEther("100");
  const tx = await token.mint(trueUserAddress, amountToMint);
  await tx.wait();
  
  const balance = await token.balanceOf(trueUserAddress);
  console.log(`Successfully minted! TRUE User balance on chain is now: ${hre.ethers.formatEther(balance)}`);
}

main().catch(console.error);
