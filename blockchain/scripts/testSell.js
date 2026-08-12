import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const ammAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  
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
