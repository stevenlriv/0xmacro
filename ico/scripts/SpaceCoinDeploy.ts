import { ethers } from "hardhat";

async function main() {
  const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
  const contract = await SpaceCoin.deploy('0x3b43FC418f0CD06E647F565f58912e54A90E1107', '0xb0F8Fd6253fb6e9B6e7bD544C46020a874993440');

  await contract.deployed();

  console.log("SpaceCoin deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
