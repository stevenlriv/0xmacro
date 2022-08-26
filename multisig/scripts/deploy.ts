import { ethers } from "hardhat";

async function main() {
  // Logic.sol
  const Logic = await ethers.getContractFactory("Logic");
  const contractLogic = await Logic.deploy();

  await contractLogic.deployed();
  console.log("Logic deployed to: ", contractLogic.address);

  await contractLogic.initialize(256);
  console.log("Logic somevariable: ", await contractLogic.someVariable());

  // Proxy.sol
  const Proxy = await ethers.getContractFactory("Proxy");
  const contractProxy = await Proxy.deploy(contractLogic.address);

  await contractProxy.deployed();
  console.log("Proxy deployed to: ", contractProxy.address);

  // transfer ownership
  const proxiedV1 = await contractLogic.attach(contractProxy.address);
  await proxiedV1.initialize(256);
  await proxiedV1.transferOwnership('0xFb6E472b314eb447C23d805d0eb794425D5C8a4e');

  // LogicImproved.sol
  const LogicImproved = await ethers.getContractFactory("LogicImproved");
  const contractLogicImproved = await LogicImproved.deploy();

  await contractLogicImproved.deployed();
  console.log("LogicImproved deployed to: ", contractLogicImproved.address);

  await contractLogicImproved.initialize(256);
  console.log("LogicImproved somevariable: ", await contractLogicImproved.someVariable());

  // transfer ownership
  await contractLogicImproved.transferOwnership('0xFb6E472b314eb447C23d805d0eb794425D5C8a4e');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
