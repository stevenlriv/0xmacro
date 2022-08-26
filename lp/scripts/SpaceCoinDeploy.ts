import { ethers } from "hardhat";

async function main() {
  const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
  const contract = await SpaceCoin.deploy('0x0AE8374b9fEe8FabF35a43cc23A31A9d2a2bC4F3', '0x005865010A235eBE9d1A40249e23b5C04B926284');

  await contract.deployed();

  console.log("SpaceCoin deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
