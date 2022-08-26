// ----------------------------------------------------------------------------
// REQUIRED: Instructions
// ----------------------------------------------------------------------------
/*
  For this first project, we've provided a significant amount of scaffolding
  in your test suite. We've done this to:

    1. Set expectations, by example, of where the bar for testing is.
    3. Reduce the amount of time consumed this week by "getting started friction".

  Please note that:

    - We will not be so generous on future projects!
    - The tests provided are about ~90% complete.
    - IMPORTANT:
      - We've intentionally left out some tests that would reveal potential
        vulnerabilities you'll need to identify, solve for, AND TEST FOR!

      - Failing to address these vulnerabilities will leave your contracts
        exposed to hacks, and will certainly result in extra points being
        added to your micro-audit report! (Extra points are _bad_.)

  Your job (in this file):

    - DO NOT delete or change the test names for the tests provided
    - DO complete the testing logic inside each tests' callback function
    - DO add additional tests to test how you're securing your smart contracts
         against potential vulnerabilties you identify as you work through the
         project.

    - You will also find several places where "FILL_ME_IN" has been left for
      you. In those places, delete the "FILL_ME_IN" text, and replace with
      whatever is appropriate.
*/
// ----------------------------------------------------------------------------

import { expect } from "chai";
import { ethers, } from "hardhat";
import { BigNumber, BigNumberish } from "ethers";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Project, ProjectFactory } from "../typechain-types";


// ----------------------------------------------------------------------------
// OPTIONAL: Constants and Helper Functions
// ----------------------------------------------------------------------------
// We've put these here for your convenience, and to make you aware these built-in
// Hardhat functions exist. Feel free to use them if they are helpful!
const SECONDS_IN_DAY: number = 60 * 60 * 24;
const ONE_ETHER: BigNumber = ethers.utils.parseEther("1");

// Bump the timestamp by a specific amount of seconds
const timeTravel = async (seconds: number) => {
  await time.increase(seconds);
};

// Or, set the time to be a specific amount (in seconds past epoch time)
const timeTravelTo = async (seconds: number) => {
  await time.increaseTo(seconds);
};

// Compare two BigNumbers that are close to one another.
//
// This is useful for when you want to compare the balance of an address after
// it executes a transaction, and you don't want to worry about accounting for
// balances changes due to paying for gas a.k.a. transaction fees.
const closeTo = async (a: BigNumberish, b: BigNumberish, margin: number) => {
  expect(a).to.be.closeTo(b, margin)
};
// ----------------------------------------------------------------------------

describe("Crowdfundr", () => {
  // See the Hardhat docs on fixture for why we're using them:
  // https://hardhat.org/hardhat-network-helpers/docs/reference#fixtures
  // In particular, they allow you to run your tests in parallel using
  // `npx hardhat test --parallel` without the error-prone side-effects
  // that come from using mocha's `beforeEach`
  async function setupFixture() {
    const [deployer, alice, bob]: SignerWithAddress[] = await ethers.getSigners();

    // NOTE: You may need to pass arguments to the `deploy` function if your
    //       ProjectFactory contract's constructor has input parameters
    const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
    const projectFactory: ProjectFactory =
      (await ProjectFactory.deploy(/* FILL_ME_IN: */)) as ProjectFactory;
    await projectFactory.deployed();

    // TODO: Your ProjectFactory contract will need a `create` method, to
    //       create new Projects
    const txReceiptUnresolved = await projectFactory.create(
          "Yolo",
          "YOLO Description",
          "YLO",
          ethers.utils.parseEther("10").toString()
    );
    const txReceipt = await txReceiptUnresolved.wait();

    const projectAddress = txReceipt.events![0].args![0];
    const project: Project = (await ethers.getContractAt("Project", projectAddress)) as Project;

    return { projectFactory, deployer, alice, bob, project, projectAddress }
  };

  describe("ProjectFactory: Additional Tests", () => {
    /* 
      TODO: You may add additional tests here if you need to

      NOTE: If you wind up writing Solidity code to protect against a
            vulnerability that is not tested for below, you should add
            at least one test here.

      DO NOT: Delete or change the test names for the tests provided below
    */
  });

  describe("ProjectFactory", () => {
    it("Deploys a contract", async () => {
      const { projectFactory, deployer, alice, bob } = await loadFixture(setupFixture);
      //console.log(projectFactory.address);

      expect(projectFactory.address).to.equal(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      );
    });

    it("Can register a single project", async () => {
      const { projectFactory, deployer, alice, bob } = await loadFixture(setupFixture);

      let newProject = await projectFactory.create('Test 1', 'TE1', 'desc 1', ethers.utils.parseEther("10").toString());
      
      expect(newProject).to.emit(projectFactory, "ProjectCreated");
    });

    it("Can register multiple projects", async () => {
      const { projectFactory, deployer, alice, bob } = await loadFixture(setupFixture);

      let newProject_1 = await projectFactory.create('Test 1', 'TE1', 'desc 1', ethers.utils.parseEther("10").toString());
      let newProject_2 = await projectFactory.create('Test 2', 'TE2', 'desc 2', ethers.utils.parseEther("10").toString());

      expect(newProject_1).to.emit(projectFactory, "ProjectCreated");
      expect(newProject_2).to.emit(projectFactory, "ProjectCreated");
    });

    it("Registers projects with the correct owner", async () => {
      expect(true).to.be.false;
    });

    it("Registers projects with a preset funding goal (in units of wei)", async () => {
      const { projectFactory, deployer, alice, bob } = await loadFixture(setupFixture);

      let newProject = await projectFactory.create('Test 1', 'TE1', 'desc 1', ethers.utils.parseEther("10").toString());
      
      expect(newProject).to.emit(projectFactory, "ProjectCreated");
    });

    it('Emits a "FILL_ME_IN" event after registering a project', async () => {
      const { projectFactory, deployer, alice, bob } = await loadFixture(setupFixture);

      let newProject = await projectFactory.create('Test 1', 'TE1', 'desc 1', ethers.utils.parseEther("10").toString());
      
      expect(newProject).to.emit(projectFactory, "ProjectCreated");
    });

    it("Allows multiple contracts to accept ETH simultaneously", async () => {
      const { projectFactory, deployer, alice, bob } = await loadFixture(setupFixture);

      let newProject_1 = await projectFactory.create('Test 1', 'TE1', 'desc 1', ethers.utils.parseEther("10").toString());
      let newProject_2 = await projectFactory.create('Test 2', 'TE2', 'desc 2', ethers.utils.parseEther("10").toString());

      expect(newProject_1).to.emit(projectFactory, "ProjectCreated");
      expect(newProject_2).to.emit(projectFactory, "ProjectCreated");
    });
  });

  
  describe("Project: Additional Tests", () => {
    /* 
      TODO: You may add additional tests here if you need to

      NOTE: If you wind up protecting against a vulnerability that is not
            tested for below, you should add at least one test here.

      DO NOT: Delete or change the test names for the tests provided below
    */
  });


  describe("Project", () => {
    describe("Contributions", () => {
      describe("Contributors", () => {
        it("Allows the creator to contribute", async () => {
          const { project, projectAddress } = await loadFixture(setupFixture);
          expect(true).to.be.false;
        });

        it("Allows any EOA to contribute", async () => {
          expect(true).to.be.false;
        });

        it("Allows an EOA to make many separate contributions", async () => {
          expect(true).to.be.false;
        });

        it('Emits a "FILL_ME_IN" event after a contribution is made', async () => {
          expect(true).to.be.false;
        });
      });

      describe("Minimum ETH Per Contribution", () => {
        it("Reverts contributions below 0.01 ETH", async () => {
          expect(true).to.be.false;
        });

        it("Accepts contributions of exactly 0.01 ETH", async () => {
          expect(true).to.be.false;
        });
      });

      describe("Final Contributions", () => {
        it("Allows the final contribution to exceed the project funding goal", async () => {
          // Note: After this contribution, the project is fully funded and should not
          //       accept any additional contributions. (See next test.)
        });

        it("Prevents additional contributions after a project is fully funded", async () => {
          expect(true).to.be.false;
        });

        it("Prevents additional contributions after 30 days have passed since Project instance deployment", async () => {
          expect(true).to.be.false;
        });
      });
    });

    describe("Withdrawals", () => {
      describe("Project Status: Active", () => {
        it("Prevents the creator from withdrawing any funds", async () => {
          expect(true).to.be.false;
        });

        it("Prevents contributors from withdrawing any funds", async () => {
          expect(true).to.be.false;
        });

        it("Prevents non-contributors from withdrawing any funds", async () => {
          expect(true).to.be.false;
        });
      });

      describe("Project Status: Success", () => {
        it("Allows the creator to withdraw some of the contribution balance", async () => {
          expect(true).to.be.false;
        });

        it("Allows the creator to withdraw the entire contribution balance", async () => {
          expect(true).to.be.false;
        });

        it("Allows the creator to make multiple withdrawals", async () => {
          expect(true).to.be.false;
        });

        it("Prevents the creator from withdrawing more than the contribution balance", async () => {
          expect(true).to.be.false;
        });

        it('Emits a "FILL_ME_IN" event after a withdrawal is made by the creator', async () => {
          expect(true).to.be.false;
        });

        it("Prevents contributors from withdrawing any funds", async () => {
          expect(true).to.be.false;
        });

        it("Prevents non-contributors from withdrawing any funds", async () => {
          expect(true).to.be.false;
        });
      });

      describe("Project Status: Failure", () => {
        it("Prevents the creator from withdrawing any funds (if not a contributor)", async () => {
          expect(true).to.be.false;
        });

        it("Prevents contributors from withdrawing any funds (though they can still refund)", async () => {
          expect(true).to.be.false;
        });

        it("Prevents non-contributors from withdrawing any funds", async () => {
          expect(true).to.be.false;
        });
      });
    });

    describe("Refunds", () => {
      it("Allows contributors to be refunded when a project fails", async () => {
        expect(true).to.be.false;
      });

      it("Prevents contributors from being refunded if a project has not failed", async () => {
        expect(true).to.be.false;
      });

      it('Emits a "FILL_ME_IN" event after a a contributor receives a refund', async () => {
        expect(true).to.be.false;
      });
    });

    describe("Cancelations (creator-triggered project failures)", () => {
      it("Allows the creator to cancel the project if < 30 days since deployment has passed ", async () => {
        expect(true).to.be.false;
      });

      it("Prevents the creator from canceling the project if at least 30 days have passed", async () => {
        expect(true).to.be.false;
      });

      it('Emits a "FILL_ME_IN" event after a project is cancelled by the creator', async () => {
        expect(true).to.be.false;
      });
    });

    describe("NFT Contributor Badges", () => {
      it("Awards a contributor with a badge when they make a single contribution of at least 1 ETH", async () => {
        expect(true).to.be.false;
      });

      it("Awards a contributor with a badge when they make multiple contributions to a single project that sum to at least 1 ETH", async () => {
        expect(true).to.be.false;
      });

      it("Does not award a contributor with a badge if their total contribution to a single project sums to < 1 ETH", async () => {
        expect(true).to.be.false;
      });

      it("Awards a contributor with a second badge when their total contribution to a single project sums to at least 2 ETH", async () => {
        // Note: One address can receive multiple badges for a single project,
        //       but they should only receive 1 badge per 1 ETH contributed.
        expect(true).to.be.false;
      });

      it("Does not award a contributor with a second badge if their total contribution to a single project is > 1 ETH but < 2 ETH", async () => {
        expect(true).to.be.false;
      });

      it("Awards contributors with different NFTs for contributions to different projects", async () => {
        expect(true).to.be.false;
      });

      it("Allows contributor badge holders to trade the NFT to another address", async () => {
        expect(true).to.be.false;
      });

      it("Allows contributor badge holders to trade the NFT to another address even after its related project fails", async () => {
        expect(true).to.be.false;
      });
    });
  });
});
