import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { BigNumber, BigNumberish } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DAO Test", function () {
    async function deployAllContract() {
      // Contracts are deployed using the first signer/account by default
      const [owner, address_1, address_2, address_3, treasury_address, address_4, address_5, address_6, address_7, address_8, address_9, address_10] = await ethers.getSigners();
  
      const DAO = await ethers.getContractFactory("DAO");
      const DAOContract = await DAO.deploy();
  
      return { DAOContract, owner, address_1, address_2, address_3, treasury_address, address_4, address_5, address_6, address_7, address_8, address_9, address_10 };
    }
  
    describe("Function contribute", function () {
      it("New member contribution", async function () {
        const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

        await DAOContract.contribute({value: ethers.utils.parseEther("1")});
      });

      it("Only 1 contribution per member", async function () {
        const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

        await DAOContract.contribute({value: ethers.utils.parseEther("1")});
        await expect(DAOContract.contribute({value: ethers.utils.parseEther("1")})).to.be.reverted;
      });

      it("Different members contributions", async function () {
        const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

        await DAOContract.contribute({value: ethers.utils.parseEther("1")});
        await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
        await DAOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1")});
      });

      it("Only accept 1 ETH contributions", async function () {
        const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

        await expect(DAOContract.contribute({value: ethers.utils.parseEther("2")})).to.be.reverted;
      });
    });

    describe("Function newProposals", function () {
        it("Needs to be a DAO member", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

          await expect(DAOContract.newProposal([address_1.address], [256], [ethers.utils.formatBytes32String("Hello world!")], "Hello world!")).to.be.reverted;
        });
  
        it("Can only be 1 proposal with the same hash active ever", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

          await DAOContract.contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.newProposal([address_1.address], [256], [ethers.utils.formatBytes32String("Hello world!")], "Hello world!");

          await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
          await expect(DAOContract.connect(address_1).newProposal([address_1.address], [256], [ethers.utils.formatBytes32String("Hello world!")], "Hello world!")).to.be.reverted;
        });
  
        it("Can only have 1 proposal at a time", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

          await DAOContract.contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.newProposal([address_1.address], [256], [ethers.utils.formatBytes32String("Hello world!")], "Hello world!");
          await expect(DAOContract.newProposal([address_1.address], [256], [ethers.utils.formatBytes32String("Hello world!")], "Hello world!")).to.be.reverted;
        });
  
      });

      describe("Votes", function () {
        it("Vote with no signature", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

          let proposalTargets = [address_1.address];
          let proposalValues = [256];
          let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
          let proposalDescription = "Hello world!";
          let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);

          await DAOContract.contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
          
          await DAOContract.voteNoSignature(proposalId, 1);
        });
  
        it("Only 1 vote per member", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);

          let proposalTargets = [address_1.address];
          let proposalValues = [256];
          let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
          let proposalDescription = "Hello world!";
          let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);

          await DAOContract.contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
          
          await DAOContract.voteNoSignature(proposalId, 1);
          await expect(DAOContract.voteNoSignature(proposalId, 1)).to.be.reverted;
        });
  
        it("Vote with signature", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);
        });
  
        it("Bulk vote with signature", async function () {
          const { DAOContract, address_1, address_2 } = await loadFixture(deployAllContract);
        });

        it("Quorum passes", async function () {
            const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

            let proposalTargets = [address_1.address];
            let proposalValues = [256];
            let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
            let proposalDescription = "Hello world!";
            let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
  
            await DAOContract.contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_3).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_4).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_5).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_6).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_7).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_8).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_9).contribute({value: ethers.utils.parseEther("1")});

            await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
            
            await DAOContract.voteNoSignature(proposalId, 1);
            await DAOContract.connect(address_1).voteNoSignature(proposalId, 1);
            await DAOContract.connect(address_2).voteNoSignature(proposalId, 1);

            await DAOContract.connect(address_3).voteNoSignature(proposalId, 2);
            await DAOContract.connect(address_4).voteNoSignature(proposalId, 2);

            expect(await DAOContract.isQuorum(proposalId)).to.equal(true);
        });

        it("Quorum fails", async function () {
            const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

            let proposalTargets = [address_1.address];
            let proposalValues = [256];
            let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
            let proposalDescription = "Hello world!";
            let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
  
            await DAOContract.contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_3).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_4).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_5).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_6).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_7).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_8).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_9).contribute({value: ethers.utils.parseEther("1")});

            await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
            
            await DAOContract.voteNoSignature(proposalId, 1);
            await DAOContract.connect(address_1).voteNoSignature(proposalId, 1);

            expect(await DAOContract.isQuorum(proposalId)).to.equal(false);
        });
      });

      describe("Execute Proposal", function () {
        it("Proposal was already executed", async function () {
            const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

            let proposalTargets = [address_1.address];
            let proposalValues = [256];
            let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
            let proposalDescription = "Hello world!";
            let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
  
            await DAOContract.contribute({value: ethers.utils.parseEther("1")});

            await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
            
            await DAOContract.voteNoSignature(proposalId, 1);

            //move timestampt 8 days in the future
            await ethers.provider.send("evm_setNextBlockTimestamp", [Date.now()+(60*60*24*8)])

            await DAOContract.executeProposal(proposalId);
  
            await expect(DAOContract.executeProposal(proposalId)).to.be.reverted;
        });
  
        it("Proposal can only be executed by a member", async function () {
            const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

            let proposalTargets = [address_1.address];
            let proposalValues = [256];
            let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
            let proposalDescription = "Hello world!";
            let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
  
            await DAOContract.contribute({value: ethers.utils.parseEther("1")});

            await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
            
            await DAOContract.voteNoSignature(proposalId, 1);
  
            await expect(DAOContract.connect(address_1).executeProposal(proposalId)).to.be.reverted;
        });
  
        it("Proposal is still ongoing, can't execute before the 7 days period", async function () {
          const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

          let proposalTargets = [address_1.address];
          let proposalValues = [256];
          let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
          let proposalDescription = "Hello world!";
          let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);

          await DAOContract.contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_3).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_4).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_5).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_6).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_7).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_8).contribute({value: ethers.utils.parseEther("1")});
          await DAOContract.connect(address_9).contribute({value: ethers.utils.parseEther("1")});

          await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
          
          await DAOContract.voteNoSignature(proposalId, 1);
          await DAOContract.connect(address_1).voteNoSignature(proposalId, 1);
          await DAOContract.connect(address_2).voteNoSignature(proposalId, 1);

          await DAOContract.connect(address_3).voteNoSignature(proposalId, 2);
          await DAOContract.connect(address_4).voteNoSignature(proposalId, 2);

          await expect(DAOContract.executeProposal(proposalId)).to.be.reverted;
        });
  
        it("Proposal passes and buys NFT", async function () {
          const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);
        });

        it("Proposal fails because of no votes", async function () {
            const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

            let proposalTargets = [address_1.address];
            let proposalValues = [256];
            let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
            let proposalDescription = "Hello world!";
            let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
  
            await DAOContract.contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_3).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_4).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_5).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_6).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_7).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_8).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_9).contribute({value: ethers.utils.parseEther("1")});
  
            await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
            
            await DAOContract.voteNoSignature(proposalId, 1);
            await DAOContract.connect(address_1).voteNoSignature(proposalId, 2);
            await DAOContract.connect(address_2).voteNoSignature(proposalId, 2);
  
            await DAOContract.connect(address_3).voteNoSignature(proposalId, 2);
            await DAOContract.connect(address_4).voteNoSignature(proposalId, 2);

            await DAOContract.connect(address_5).voteNoSignature(proposalId, 2);
            await DAOContract.connect(address_6).voteNoSignature(proposalId, 2);
  
            //move timestampt 8 days in the future
            await ethers.provider.send("evm_setNextBlockTimestamp", [Date.now()+(60*60*24*8)])
  
            await expect(DAOContract.executeProposal(proposalId)).to.not.be.reverted;
            expect(await DAOContract.proposalStatus(proposalId)).to.equal(3);
        });

        it("Proposal fails because of no quorum", async function () {
            const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

            let proposalTargets = [address_1.address];
            let proposalValues = [256];
            let proposalCalldatas = [ethers.utils.formatBytes32String("Hello world!")];
            let proposalDescription = "Hello world!";
            let proposalId = await DAOContract.hashProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
  
            await DAOContract.contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_3).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_4).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_5).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_6).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_7).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_8).contribute({value: ethers.utils.parseEther("1")});
            await DAOContract.connect(address_9).contribute({value: ethers.utils.parseEther("1")});
  
            await DAOContract.newProposal(proposalTargets, proposalValues, proposalCalldatas, proposalDescription);
            
            await DAOContract.voteNoSignature(proposalId, 1);
  
            //move timestampt 8 days in the future
            await ethers.provider.send("evm_setNextBlockTimestamp", [Date.now()+(60*60*24*8)])
  
            await expect(DAOContract.executeProposal(proposalId)).to.not.be.reverted;
            expect(await DAOContract.proposalStatus(proposalId)).to.equal(3);
        });

        it("Test calling NFT Buy function with random address and fails", async function () {
          const { DAOContract, address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9 } = await loadFixture(deployAllContract);

          await expect(DAOContract.connect(address_1).buyNFTFromMarketplace("0xC627257eA77eD6B467D4376D237Bce8acB816C91", 222, ethers.utils.parseEther("1"))).to.be.reverted;
        });
      });
  });