import { ethers } from "hardhat";

async function main() {
  const Router = await ethers.getContractFactory("Router");
  const contract = await Router.deploy('0xec49Ea39f6B6A3dD9C606Ed33E590e8d9402Fb9d', '0xf72bC522601e439E7F979809d380A12E8149aca6');

  await contract.deployed();

  console.log("Router deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
