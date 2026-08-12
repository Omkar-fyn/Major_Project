import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Addresses to fund
  const addresses = [
    "0x20D0835F5ebbbE67aFF4B4a2bA59c03b8794Bcb3", // From Screenshot (Account 1)
    "0x2C811D110f429a94A640E930321C9f25c4545C9F", // omkar bharath
    "0x9594A397ea811624a0DCa0ed12Cbf30FcE3D0959", // Admin
    "0x86A5BCEe094a76e090BbeDbfBD1FC494b5c4c308",
    "0xA7Ef72317d68389c893f0D8fe46DF2447Aa0707C",
    "0xC3C96208222921312E7119494726b0Ec2172d5c8"
  ];

  for (const address of addresses) {
    if (address) {
      console.log(`Funding ${address}...`);
      try {
        const tx = await deployer.sendTransaction({
          to: address,
          value: hre.ethers.parseEther("100.0") // Send 100 ETH
        });
        await tx.wait();
        console.log(`Funded ${address} successfully!`);
      } catch (e) {
        console.log(`Could not fund ${address}: ${e.message}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
