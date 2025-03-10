import { ethers } from "hardhat";

async function main() {
  const DAO = await ethers.getContractFactory("DAO");
  const contract = await DAO.deploy();

  await contract.deployed();

  console.log("DAO deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
