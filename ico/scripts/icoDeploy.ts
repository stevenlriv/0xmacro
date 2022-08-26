import { ethers } from "hardhat";

async function main() {
  const ICO = await ethers.getContractFactory("ICO");
  const contract = await ICO.deploy();

  await contract.deployed();

  console.log("ICO deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
