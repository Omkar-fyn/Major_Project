import hre from "hardhat";

async function main() {
  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
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
