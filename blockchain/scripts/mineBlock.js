import hre from "hardhat";

async function main() {
  await hre.network.provider.send("evm_mine");
  console.log("Mined a new block to bust MetaMask cache!");
}

main().catch(console.error);
