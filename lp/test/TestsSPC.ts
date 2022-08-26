import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { BigNumber, BigNumberish } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SpaceCoin Contract", function () {
  async function deploySpaceCoin() {
    // Contracts are deployed using the first signer/account by default
    const [owner, address_1, address_2, address_3, ico_address, treasury_address] = await ethers.getSigners();

    const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
    const contract = await SpaceCoin.deploy(ico_address.address, treasury_address.address);

    return { contract, owner, address_1, address_2, address_3, ico_address, treasury_address };
  }

  describe("Deployment", function () {
    it("Is named SpaceCoin?", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.name()).to.equal('SpaceCoin');
    });

    it("Is represented by the symbol SPC?", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.symbol()).to.equal('SPC');
    });

    it("Has a total supply of 500k", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.totalSupply()).to.equal(ethers.utils.parseEther("500000"));
    });

    it("Allocate 150k tokens to ICO investors", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.ICO_SUPPLY()).to.equal(ethers.utils.parseEther("150000"));
    });

    it("Stores the remaining 350k tokens in treasury address", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.TREASURY_SUPPLY()).to.equal(ethers.utils.parseEther("350000"));
    });

    it("Allow owner to toggle of/on tax", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      //change state
      await contract.enableDisableTax();

      expect(await contract.isTaxEnable()).to.equal(true);

      //change state
      await contract.enableDisableTax();

      expect(await contract.isTaxEnable()).to.equal(false);
    });

    it("Dont allow non-owner to toggle of/on tax", async function () {
      const { contract, address_1 } = await loadFixture(deploySpaceCoin);

      //change state it should not change as this is another user
      //default state is false so it should stay that way
      await expect(contract.connect(address_1).enableDisableTax()).to.be.reverted;
    });

    it("Defaults to no tax after deployment", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.isTaxEnable()).to.equal(false);
    });

    it("Charges 2% for SPC transfers", async function () {
      const { contract } = await loadFixture(deploySpaceCoin);

      expect(await contract.TAX_PERCENTAGE()).to.equal(2);
    });
  });
});

describe("ICO Contract", function () {
  async function deployICOContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, address_1, address_2, address_3, token_address, treasury_address,
      address_4, address_5, address_6, address_7, address_8, address_9, address_10, 
      address_11, address_12, address_13, address_14,
      address_15, address_16, address_17, address_18, address_19, address_20, address_21, 
      address_22, address_23, address_24, address_25, address_26, address_27, address_28] = await ethers.getSigners();

    const ICO = await ethers.getContractFactory("ICO");
    const contract = await ICO.deploy();

    const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
    const token_contract = await SpaceCoin.deploy(contract.address, treasury_address.address);

    return { contract, token_contract, owner, address_1, address_2, address_3, token_address, address_4, address_5, address_6, address_7, address_8, address_9, address_10, 
      address_11 };
  }

  describe("Deployment", function () {
    it("Allow owner to set SpaceCoin address one time only", async function () {
      const { contract, address_1, token_contract } = await loadFixture(deployICOContract);

      //set address
      await contract.setTokenContract(token_contract.address);

      expect(await contract.tokenAddress()).to.equal(token_contract.address);

      //set again, it should revert
      await expect(contract.setTokenContract(address_1.address)).to.be.reverted;
    });

    it("Prevents non owner from setting SpaceCoin address", async function () {
      const { contract, address_1 } = await loadFixture(deployICOContract);
      
      await expect(contract.connect(address_1).setTokenContract(address_1.address)).to.be.reverted;
    });
  });

  describe("Management", function () {
    it("Allow owner to advance phase forward", async function () {
      const { contract } = await loadFixture(deployICOContract);

      //lets enable the ico
      await contract.enableDisableICO();

      // lets start with phase 0 and check if we are advansing
      expect(await contract.currentPhase()).to.equal(0);

      // start next phase
      await contract.progressPhases(1);

      expect(await contract.currentPhase()).to.equal(1);

      // start next phase
      await contract.progressPhases(2);

      expect(await contract.currentPhase()).to.equal(2);
      
      // we should not be able to move forward from here
      await expect(contract.progressPhases(3)).to.be.reverted;
    });

    it("Prevents non owner from setting advancing phases", async function () {
      const { contract, address_1 } = await loadFixture(deployICOContract);
      
      await expect(contract.connect(address_1).progressPhases(1)).to.be.reverted;
    });

    it("Emit phase advance event after a phase move forward", async function () {
      const { contract, address_1 } = await loadFixture(deployICOContract);

      //lets enable the ico
      await contract.enableDisableICO();

      await expect(contract.progressPhases(1))
      .to.emit(contract, "NewPhase")
      .withArgs(1);
    });

    it("Allow owner to pause/resume ICO at any time", async function () {
      const { contract } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      expect(await contract.isICOEnable()).to.equal(true);

      //change state
      await contract.enableDisableICO();

      expect(await contract.isICOEnable()).to.equal(false);
    });

    it("Dont allow non-owner to pause/resume ICO", async function () {
      const { contract, address_1 } = await loadFixture(deployICOContract);

      //change state it should not change as this is another user
      //default state is false so it should stay that way
      await expect(contract.connect(address_1).enableDisableICO()).to.be.reverted;
    });

    it("Allow owner to set investors to the whitelist and remove them", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //add investors
      await contract.addSeedInvestors(address_1.address);
      await contract.addSeedInvestors(address_2.address);

      expect(await contract.seedInvestors(address_1.address)).to.equal(true);
      expect(await contract.seedInvestors(address_2.address)).to.equal(true);
    });

    it("Prevent non owner to set investors to the whitelist and remove them", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //add investors
      await expect(contract.connect(address_1).addSeedInvestors(address_1.address)).to.be.reverted;

      //remove investors
      await expect(contract.connect(address_1).addSeedInvestors(address_1.address)).to.be.reverted;
    });
  });

  describe("SeedPhase", function () {
    it("Allow contributions from whitelisted investors", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      //add investors and contribute
      await contract.addSeedInvestors(address_1.address);
      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")});

      expect(await contract.contributionsByAddress(address_1.address)).to.equal(ethers.utils.parseEther("2"));
    });

    it("Block contributions from non-whitelisted investors", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      //add investors and contribute
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")})).to.be.reverted;
    });

    it("Emit a contribution event for seed round", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      //add investors and contribute
      await contract.addSeedInvestors(address_1.address);
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")}))
      .to.emit(contract, "NewContribution")
      .withArgs(address_1.address, ethers.utils.parseEther("2"), 0);
    });

    it("Block contributions when fundraising is paused", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //add investors and contribute
      //it should revert because contract is paused
      await contract.addSeedInvestors(address_1.address);
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")})).to.be.reverted;
    });

    it("Dont allow to claim tokens until phase open", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      //add investors and contribute
      await contract.addSeedInvestors(address_1.address);
      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")});

      await expect(contract.connect(address_1).claimTokens()).to.be.reverted;
    });

    it("Block contributions from above individual limit for this phase", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      await contract.addSeedInvestors(address_1.address);
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("1501")})).to.be.reverted;
    });

    it("Block contributions above softcap for this round", async function () {
      const { contract, address_1, address_2, address_3, address_4,
        address_5, address_6, address_7, address_8, address_9, address_10, address_11} = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();

      await contract.addSeedInvestors(address_1.address);
      await contract.addSeedInvestors(address_2.address);
      await contract.addSeedInvestors(address_3.address);
      await contract.addSeedInvestors(address_4.address);
      await contract.addSeedInvestors(address_5.address);
      await contract.addSeedInvestors(address_6.address);
      await contract.addSeedInvestors(address_7.address);
      await contract.addSeedInvestors(address_8.address);
      await contract.addSeedInvestors(address_9.address);
      await contract.addSeedInvestors(address_10.address);
      await contract.addSeedInvestors(address_11.address);

      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_3).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_4).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_5).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_6).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_7).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_8).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_9).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_10).contribute({value: ethers.utils.parseEther("1500")});

      //let currentETH = ethers.utils.formatEther(await contract.totalContributed());
      //console.log(currentETH);

      // this will go over the softcap of 15k for this round and should revert
      await expect(contract.connect(address_11).contribute({value: ethers.utils.parseEther("1000")})).to.be.reverted;
    });
  });

  describe("GeneralPhase", function () {
    it("Allow contributions from whitelisted investors", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.progressPhases(1);

      //add investors and contribute
      await contract.addSeedInvestors(address_1.address);
      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")});

      expect(await contract.contributionsByAddress(address_1.address)).to.equal(ethers.utils.parseEther("2"));
    });

    it("Allow contributions from non-whitelisted investors", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.progressPhases(1);

      //contribute and verify
      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")});
      expect(await contract.contributionsByAddress(address_1.address)).to.equal(ethers.utils.parseEther("2"));
    });

    it("Emit a contribution event for seed round", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.progressPhases(1);

      //add contribute
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")}))
      .to.emit(contract, "NewContribution")
      .withArgs(address_1.address, ethers.utils.parseEther("2"), 1);
    });

    it("Block contributions when fundraising is paused", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //add investors and contribute
      //it should revert because contract is paused
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")})).to.be.reverted;
    });

    it("Dont allow to claim tokens until phase open", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.progressPhases(1);

      //add investors and contribute
      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")});

      await expect(contract.connect(address_1).claimTokens()).to.be.reverted;
    });

    it("Block contributions from above individual limit for this phase", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.progressPhases(1);

      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("1001")})).to.be.reverted;
    });

    it("Block contributions above hardcap for this round", async function () {
      const { contract, address_1, address_2, address_3, token_contract, address_4, address_5, address_6, address_7, address_8, address_9, address_10, 
        address_11 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.setTokenContract(token_contract.address);

      //let SPCBalance = await token_contract.balanceOf(contract.address);
      //console.log('SPC Balance: ' + SPCBalance);

      await contract.addSeedInvestors(address_1.address);
      await contract.addSeedInvestors(address_2.address);
      await contract.addSeedInvestors(address_3.address);
      await contract.addSeedInvestors(address_4.address);
      await contract.addSeedInvestors(address_5.address);
      await contract.addSeedInvestors(address_6.address);
      await contract.addSeedInvestors(address_7.address);
      await contract.addSeedInvestors(address_8.address);
      await contract.addSeedInvestors(address_9.address);
      await contract.addSeedInvestors(address_10.address);

      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_3).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_4).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_5).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_6).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_7).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_8).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_9).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_10).contribute({value: ethers.utils.parseEther("1500")});

      //change state
      await contract.progressPhases(1);//phase=1. general phase
      await contract.progressPhases(2);//phase=2. open phase with no limit so they can invest gaian

      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_3).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_4).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_5).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_6).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_7).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_8).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_9).contribute({value: ethers.utils.parseEther("1500")});
      await contract.connect(address_10).contribute({value: ethers.utils.parseEther("1500")});

      // this will go over the softcap of 30k for this round and should revert
      await expect(contract.connect(address_11).contribute({value: ethers.utils.parseEther("1000")})).to.be.reverted;
    });
  });


  describe("OpenPhase", function () {
    it("Automatically send contributions to investors", async function () {
      const { contract, address_1, address_2, token_contract } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.setTokenContract(token_contract.address);
      await contract.progressPhases(1);//phase=1. general phase
      await contract.progressPhases(2);//phase=2. open phase with no limit so they can invest gaian

      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});

      expect(await contract.claimableContributionsByAddress(address_1.address)).to.equal(0);
    });

    it("Emit a contribution event for open round", async function () {
      const { contract, address_1, address_2, token_contract } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.setTokenContract(token_contract.address);
      await contract.progressPhases(1);//phase=1. general phase
      await contract.progressPhases(2);//phase=2. open phase with no limit so they can invest gaian

      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});

      //add contribute
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")}))
      .to.emit(contract, "NewContribution")
      .withArgs(address_1.address, ethers.utils.parseEther("1500"), 2);
    });

    it("Block contributions when fundraising is paused", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //add investors and contribute
      //it should revert because contract is paused
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("2")})).to.be.reverted;
    });

    it("Allow to claim tokens its phase open", async function () {
      const { contract, address_1, address_2, token_contract } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.setTokenContract(token_contract.address);
      await contract.progressPhases(1);//phase=1. general phase

      await contract.connect(address_1).contribute({value: ethers.utils.parseEther("1000")});

      //change state
      await contract.progressPhases(2);//phase=2. open phase with no limit so they can invest gaian and claim tokens
      await contract.connect(address_1).claimTokens();

      expect(await contract.claimableContributionsByAddress(address_1.address)).to.equal(0);
    });

    it("Emit a redeem event after claiming", async function () {
      const { contract, address_1, address_2, token_contract } = await loadFixture(deployICOContract);

      //change state
      //console.log(ethers.utils.parseEther("1"));
      await contract.enableDisableICO();
      await contract.setTokenContract(token_contract.address);
      await contract.progressPhases(1);//phase=1. general phase
      await contract.progressPhases(2);//phase=2. open phase with no limit so they can invest gaian

      //add contribute
      await expect(contract.connect(address_1).contribute({value: ethers.utils.parseEther("1")}))
      .to.emit(contract, "TokensClaimed")
      .withArgs(address_1.address, ethers.utils.parseEther("5"));
    });

    it("Prevent unearned token redemptions", async function () {
      const { contract, address_1, address_2 } = await loadFixture(deployICOContract);

      //change state
      await contract.enableDisableICO();
      await contract.progressPhases(1); //phase=1
      await contract.progressPhases(2); //phase=2

      await expect(contract.connect(address_1).claimTokens()).to.be.reverted;
    });

  });
});