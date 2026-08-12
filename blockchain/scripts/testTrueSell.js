import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const ammAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  
  // Impersonate the TRUE user
  const trueUserAddress = "0x20D0847384A01b95c50234a7239F6fFD39f4Bcb3";
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [trueUserAddress],
  });
  const userSigner = await hre.ethers.getSigner(trueUserAddress);
  
  // Fund user with ETH to pay gas
  await deployer.sendTransaction({ to: trueUserAddress, value: hre.ethers.parseEther("1") });

  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const token = PropertyToken.attach(tokenAddress).connect(userSigner);
  
  const BondingCurveAMM = await hre.ethers.getContractFactory("BondingCurveAMM");
  const amm = BondingCurveAMM.attach(ammAddress).connect(userSigner);
  
  const amountToSell = hre.ethers.parseEther("10");
  
  console.log("Approving AMM for TRUE user...");
  const approveTx = await token.approve(ammAddress, amountToSell);
  await approveTx.wait();
  console.log("Approved.");
  
  console.log("Selling 10 tokens...");
  try {
    const tx = await amm.sellTokens(amountToSell);
    const receipt = await tx.wait();
    console.log(`Sold 10 tokens successfully! Tx Hash: ${receipt.hash}`);
    
    const newBalance = await token.balanceOf(trueUserAddress);
    console.log(`New on-chain balance: ${hre.ethers.formatEther(newBalance)}`);
  } catch (error) {
    console.error("Sell failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
