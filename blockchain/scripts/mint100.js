import hre from "hardhat";

async function main() {
  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
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
