import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const ammAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const AMM = await hre.ethers.getContractAt("BondingCurveAMM", ammAddress);

  // create a random wallet and fund it
  const randomWallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  await deployer.sendTransaction({ to: randomWallet.address, value: hre.ethers.parseEther("1") });

  console.log("Simulating buyTokens from random wallet:", randomWallet.address);
  try {
    const tx = await AMM.connect(randomWallet).buyTokens({ value: hre.ethers.parseEther("0.001") });
    const receipt = await tx.wait();
    console.log("Success! Tx:", receipt.hash);
  } catch (error) {
    console.error("Transaction failed!");
    console.error(error);
  }
}

main().catch(console.error);
