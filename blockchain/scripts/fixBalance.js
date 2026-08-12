import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const userAddress = "0x20D0835F5eBbBE67AfF4B4a2Ba59C03B8794bcB3";
  
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const token = PropertyToken.attach(tokenAddress).connect(deployer);
  
  const amountToMint = hre.ethers.parseEther("30"); // The amount the database thinks they have
  
  console.log(`Minting 30 tokens to ${userAddress}...`);
  const tx = await token.mint(userAddress, amountToMint);
  await tx.wait();
  
  const balance = await token.balanceOf(userAddress);
  console.log(`Success! New balance of user: ${hre.ethers.formatEther(balance)} tokens`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
