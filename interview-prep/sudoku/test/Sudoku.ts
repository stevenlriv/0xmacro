import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const getsudokuChallenge = await ethers.getContractFactory("SudokuChallenge");
    const sudokuChallenge = await getsudokuChallenge.deploy([
      3, 0, 6, 5, 0, 8, 4, 0, 0,
      5, 2, 0, 0, 0, 0, 0, 0, 0,
      0, 8, 7, 0, 0, 0, 0, 3, 1,
      0, 0, 3, 0, 1, 0, 0, 8, 0,
      9, 0, 0, 8, 6, 3, 0, 0, 5,
      0, 5, 0, 0, 9, 0, 6, 0, 0,
      1, 3, 0, 0, 0, 0, 2, 5, 0,
      0, 0, 0, 0, 0, 0, 0, 7, 4,
      0, 0, 5, 2, 0, 6, 3, 0, 0
    ]);

    return { sudokuChallenge, owner, otherAccount };
  }

  describe("SudokuChallenge", function () {
    it("test uint8", async function () {
      const { sudokuChallenge, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);

      //expect(await sudokuChallenge.unlockTime()).to.be.reverted;
    });

  });
});
