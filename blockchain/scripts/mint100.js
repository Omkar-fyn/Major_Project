import hre from "hardhat";

async function main() {
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const userAddress = "0x20D0835F5eBbBE67AfF4B4a2Ba59C03B8794bcB3";
  
  const token = await hre.ethers.getContractAt("PropertyToken", tokenAddress);
  
  // Mint 100 tokens
  const amountToMint = hre.ethers.parseEther("100");
  const tx = await token.mint(userAddress, amountToMint);
  await tx.wait();
  
  const balance = await token.balanceOf(userAddress);
  console.log(`Successfully minted! User balance on chain is now: ${hre.ethers.formatEther(balance)}`);
}

main().catch(console.error);
