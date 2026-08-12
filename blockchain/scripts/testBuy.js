import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const ammAddress = "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";
  const AMM = await hre.ethers.getContractAt("BondingCurveAMM", ammAddress);

  console.log("Simulating buyTokens from:", deployer.address);
  try {
    const tx = await AMM.connect(deployer).buyTokens({ value: hre.ethers.parseEther("0.001") });
    const receipt = await tx.wait();
    console.log("Success! Tx:", receipt.hash);
  } catch (error) {
    console.error("Transaction failed!");
    console.error(error);
  }
}

main().catch(console.error);
