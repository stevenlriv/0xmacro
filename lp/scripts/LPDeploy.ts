import { ethers } from "hardhat";

async function main() {
  const Pool = await ethers.getContractFactory("Pool");
  const contract = await Pool.deploy('0xec49Ea39f6B6A3dD9C606Ed33E590e8d9402Fb9d');

  await contract.deployed();

  console.log("Pool deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
