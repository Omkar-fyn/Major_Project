import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  // The ACTUAL correct address from the error trace
  const userAddress = "0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3";
  
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const token = PropertyToken.attach(tokenAddress).connect(deployer);
  
  console.log(`Minting 1000 tokens to ${userAddress}...`);
  const tx = await token.mint(userAddress, hre.ethers.parseEther("1000"));
  await tx.wait();
  
  console.log(`Minted 1000 tokens to ${userAddress} successfully!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
