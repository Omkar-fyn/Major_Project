import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokenAddress = "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";
  const ammAddress = "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";
  
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
