import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const ammAddress = "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";
  
  // Impersonate the user
  const userAddress = "0x20D0835F5eBbBE67AfF4B4a2Ba59C03B8794bcB3";
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [userAddress],
  });
  const userSigner = await hre.ethers.getSigner(userAddress);
  
  // Fund user with ETH to pay gas
  await deployer.sendTransaction({ to: userAddress, value: hre.ethers.parseEther("1") });

  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const token = PropertyToken.attach(tokenAddress).connect(userSigner);
  
  const BondingCurveAMM = await hre.ethers.getContractFactory("BondingCurveAMM");
  const amm = BondingCurveAMM.attach(ammAddress).connect(userSigner);
  
  const amount = hre.ethers.parseEther("30");
  
  console.log("Approving AMM...");
  await token.approve(ammAddress, amount);
  console.log("Approved.");
  
  console.log("Selling tokens...");
  try {
    const tx = await amm.sellTokens(amount);
    await tx.wait();
    console.log("Sold successfully!");
  } catch (error) {
    console.error("Sell failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
