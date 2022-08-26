import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { BigNumber, BigNumberish } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("All Contracts", function () {
    async function deployAllContract() {
      // Contracts are deployed using the first signer/account by default
      const [owner, address_1, address_2, address_3, treasury_address, address_4, address_5, address_6, address_7, address_8, address_9, address_10] = await ethers.getSigners();
  
      const ICO = await ethers.getContractFactory("ICO");
      const ICOContract = await ICO.deploy();
  
      const SpaceCoin = await ethers.getContractFactory("SpaceCoin");
      const SpaceCoinContract = await SpaceCoin.deploy(ICOContract.address, treasury_address.address);

      const Pool = await ethers.getContractFactory("Pool");
      const PoolContract = await Pool.deploy(SpaceCoinContract.address);

      const Router = await ethers.getContractFactory("Router");
      const RouterContract = await Router.deploy(SpaceCoinContract.address, PoolContract.address);
  
      return { ICOContract, SpaceCoinContract, PoolContract, RouterContract, owner, address_1, address_2, address_3, treasury_address, address_4, address_5, address_6, address_7, address_8, address_9, address_10 };
    }
  
    describe("End-to-end Test", function () {
      it("Raising funds via the ICO, withdrawing them to the treasury, and then depositing an even worth of ETH and SPC into your liquidity contract", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);
      });

      it("Adding liquidity from another address", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_2.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_2.address)).to.not.equal(0);
      });

      it("Adding liquidity from another address", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_2.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_2.address)).to.not.equal(0);
      });

      it("Removing liquidity", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});

        // approve lp tokens
        let lpBalance = await PoolContract.balanceOf(address_1.address);
        //console.log(lpBalance);

        await PoolContract.connect(address_1).approve(RouterContract.address, lpBalance);
        expect(await PoolContract.allowance(address_1.address, RouterContract.address)).to.equal(lpBalance);

        // remove liquidity
        await RouterContract.removeLiquidity(address_1.address);
        expect(await PoolContract.balanceOf(address_1.address)).to.equal(0);
      });

      // 10 ETH * 50 SPC = 500
      // 11 ETH * ? SPC = 500
      // ? SPC = 500/11 = 45.45
      // SPC amount = OLDy - NEWy
      // SPC amount = 50 - 45.45 = 4.55
      it("Swap tokens and receive aprox 4.55 (-0.05 fee) SPC from 1 ETH in", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("50");
        let ethAmount = ethers.utils.parseEther("10");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // swap
        let ethAmountIN = ethers.utils.parseEther("1");
        // expected amount = 5
        // actual amount = 4.55 - 0.05 fee = 4.5
        let spcAmountMinimum = ethers.utils.parseEther("4.50");

            // calculate the amount we are getting back
            let reserveETH = await PoolContract.reserveETH();
            let reserveSPC = await PoolContract.reserveSPC();

            let spcAmountBeforeSwap = parseFloat(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_2.address)));
            //console.log('Before SWAP ' + spcAmountBeforeSwap);

            //let quote = await RouterContract._calculateExpectedAmount(ethAmountIN, reserveETH, reserveSPC);
            //console.log('Expected Amount: ' + ethers.utils.formatEther(quote));

            //let actualAmount = await RouterContract._calculateActualAmount(ethAmountIN, reserveETH, reserveSPC);
            //console.log('Actual Amount: ' + ethers.utils.formatEther(actualAmount));

        await RouterContract.connect(address_2).swapTokens(address_2.address, ethAmountIN, 0, spcAmountMinimum,  {value: ethAmountIN});
        
            let spcAmountAfterSwap = parseFloat(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_2.address)));
            //console.log('After SWAP ' + spcAmountAfterSwap);
        expect(spcAmountAfterSwap-spcAmountBeforeSwap).to.equal(4.5);
      });

      // 10 ETH * 50 SPC = 500
      // ? ETH * 55 SPC = 500
      // ? ETH = 500/55 = 9.09
      // ETH amount = OLDx - NEWx
      // ETH amount = 10 - 9.09 = 0.91
      it("Swap tokens and receive aprox 0.91 (-0.01 fee) SPC from 5 SPC in", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("50");
        let ethAmount = ethers.utils.parseEther("10");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // swap
        let spcAmountIN = ethers.utils.parseEther("5");
        // expected amount = 1
        // actual amount = 0.91 - 0.01 fee = 0.9
        let ethMinimum = ethers.utils.parseEther("0.9");

            // calculate the amount we are getting back
            let reserveETH = await PoolContract.reserveETH();
            let reserveSPC = await PoolContract.reserveSPC();

            //let quote = await RouterContract._calculateExpectedAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Expected Amount: ' + ethers.utils.formatEther(quote));

            //let actualAmount = await RouterContract._calculateActualAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Actual Amount: ' + ethers.utils.formatEther(actualAmount));

        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmountIN);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmountIN);

        let ethAmountBeforeSwap = parseFloat(ethers.utils.formatEther(await address_2.getBalance()));

        await RouterContract.connect(address_2).swapTokens(address_2.address, 0, spcAmountIN, ethMinimum);

        let ethAmountAfterSwap = parseFloat(ethers.utils.formatEther(await address_2.getBalance()));
        expect(ethAmountAfterSwap-ethAmountBeforeSwap).to.be.closeTo(0.9, 1);

      });

      it("Swap SPC for ETH but fail because no liquidity available", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("50");
        let ethAmount = ethers.utils.parseEther("10");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // swap
        let spcAmountIN = ethers.utils.parseEther("5");
        // expected amount = 1
        // actual amount = 0.91 - 0.01 fee = 0.9
        let ethMinimum = ethers.utils.parseEther("0.9");

            // calculate the amount we are getting back
            let reserveETH = await PoolContract.reserveETH();
            let reserveSPC = await PoolContract.reserveSPC();

        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmountIN);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmountIN);

        await expect(RouterContract.connect(address_2).swapTokens(address_2.address, 0, spcAmountIN, ethMinimum)).to.be.reverted;
      });

      it("Swap but fail because 10% slippage and expected 5%", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("50");
        let ethAmount = ethers.utils.parseEther("10");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // swap
        let spcAmountIN = ethers.utils.parseEther("5");
        // expected amount = 1
        // actual amount = 0.91 - 0.01 fee = 0.9
        let ethMinimum = ethers.utils.parseEther("0.95");

        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmountIN);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmountIN);

        await expect(RouterContract.connect(address_2).swapTokens(address_2.address, 0, spcAmountIN, ethMinimum)).to.be.reverted;
      });

      it("Swap but fail because 2% slippage and expected 1%", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("500");
        let ethAmount = ethers.utils.parseEther("100");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // swap
        let spcAmountIN = ethers.utils.parseEther("5");
        // expected amount = 1
        // actual amount = 0.99 - 0.01 fee = 0.98
        let ethMinimum = ethers.utils.parseEther("0.99");

            // calculate the amount we are getting back
            let reserveETH = await PoolContract.reserveETH();
            let reserveSPC = await PoolContract.reserveSPC();

            //let quote = await RouterContract._calculateExpectedAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Expected Amount: ' + ethers.utils.formatEther(quote));

            //let actualAmount = await RouterContract._calculateActualAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Actual Amount: ' + ethers.utils.formatEther(actualAmount));

        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmountIN);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmountIN);

        await expect(RouterContract.connect(address_2).swapTokens(address_2.address, 0, spcAmountIN, ethMinimum)).to.be.reverted;
      });

      it("Swap tokens with 0.1% slippage", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5000");
        let ethAmount = ethers.utils.parseEther("1000");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // swap
        let spcAmountIN = ethers.utils.parseEther("5");
        // expected amount = 1
        // actual amount = 0.999 - 0.01 fee = 0.989
        let ethMinimum = ethers.utils.parseEther("0.989");

            // calculate the amount we are getting back
            let reserveETH = await PoolContract.reserveETH();
            let reserveSPC = await PoolContract.reserveSPC();

            //let quote = await RouterContract._calculateExpectedAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Expected Amount: ' + ethers.utils.formatEther(quote));

            //let actualAmount = await RouterContract._calculateActualAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Actual Amount: ' + ethers.utils.formatEther(actualAmount));

        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmountIN);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmountIN);

        await expect(RouterContract.connect(address_2).swapTokens(address_2.address, 0, spcAmountIN, ethMinimum)).to.not.be.reverted;
      });

      it("Start an lp with just ETH, and fail because missing SPC", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // add liquidity
        await expect(RouterContract.addLiquidity(address_2.address, ethAmount, 0, ethAmount, 0, {value: ethAmount})).to.be.reverted;
      });

      it("Start an lp with just SPC, and fail because missing ETH", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await expect(RouterContract.addLiquidity(address_1.address, 0, spcAmount, 0, spcAmount)).to.be.reverted;
      });

      it("Have 2 lp providers", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // approve funds for pool
        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_2.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_2.address)).to.not.equal(0);
      });

      it("Have 2 lp providers - Router amountSPCOptimal <= _spcAmount test", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // approve funds for pool
        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        // reverts because 'Router: Not enought SPC tokens to make LP'
        await expect(RouterContract.addLiquidity(address_2.address, ethers.utils.parseEther("0.5"), spcAmount, ethAmount, spcAmount, {value: ethers.utils.parseEther("0.5")})).to.be.reverted;
      });

      it("Have 2 lp providers - assert(amountETHOptimal <= _ethAmount) test", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5");
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // approve funds for pool
        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmount);

        // add liquidity
        // reverts because 'Router: Not enought ETH to make LP'
        await expect(RouterContract.addLiquidity(address_2.address, ethAmount, ethers.utils.parseEther("0.5"), ethAmount, spcAmount, {value: ethAmount})).to.be.reverted;
      });

      it("Removing liquidity and fail because no liquidity available", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // approve lp tokens
        let lpBalance = await PoolContract.balanceOf(address_1.address);
        //console.log(lpBalance);

        await PoolContract.connect(address_1).approve(RouterContract.address, lpBalance);
        expect(await PoolContract.allowance(address_1.address, RouterContract.address)).to.equal(lpBalance);

        // remove liquidity
        await expect(RouterContract.removeLiquidity(address_1.address)).to.be.reverted;
      });


      it("Adding liquidity while SpaceCoin tax is enabled", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5.1");// to cover for tax and keep rate at 5:1
        let ethAmount = ethers.utils.parseEther("1"); 

        // approve funds for pool
        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmount);

        // enable tax
        await SpaceCoinContract.enableDisableTax();
        
        // add liquidity
        await RouterContract.addLiquidity(address_2.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_2.address)).to.not.equal(0);
      });

      it("Removing liquidity while SpaceCoin tax is enable", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("5.1");// to cover for tax and keep rate at 5:1
        let ethAmount = ethers.utils.parseEther("1");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // enable tax
        await SpaceCoinContract.enableDisableTax();

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});

        // approve lp tokens
        let lpBalance = await PoolContract.balanceOf(address_1.address);
        //console.log(lpBalance);

        await PoolContract.connect(address_1).approve(RouterContract.address, lpBalance);
        expect(await PoolContract.allowance(address_1.address, RouterContract.address)).to.equal(lpBalance);

        // remove liquidity
        await RouterContract.removeLiquidity(address_1.address);
        expect(await PoolContract.balanceOf(address_1.address)).to.equal(0);
      });

      it("Swap tokens with standard 10% slippage while SpaceCoin tax is enabled", async function () {
        const { ICOContract, SpaceCoinContract, RouterContract, PoolContract, treasury_address, address_1, address_2 } = await loadFixture(deployAllContract);
  
        // raise funds
        await ICOContract.enableDisableICO();
        await ICOContract.setTokenContract(SpaceCoinContract.address);
        await ICOContract.progressPhases(1);
        await ICOContract.progressPhases(2);

        await ICOContract.connect(address_1).contribute({value: ethers.utils.parseEther("1500")});
        await ICOContract.connect(address_2).contribute({value: ethers.utils.parseEther("1500")});

        // withdraw
        await ICOContract.withdraw(treasury_address.address, ethers.utils.parseEther("3000"));

        // depositing an lp positiong
        // console.log(ethers.utils.formatEther(await SpaceCoinContract.balanceOf(address_1.address)));
        let spcAmount = ethers.utils.parseEther("51");//1 to account for 2% tax
        let ethAmount = ethers.utils.parseEther("10");

        // approve funds for pool
        await SpaceCoinContract.connect(address_1).approve(RouterContract.address, spcAmount);
        expect(await SpaceCoinContract.allowance(address_1.address, RouterContract.address)).to.equal(spcAmount);

        // enable tax
        await SpaceCoinContract.enableDisableTax();

        // add liquidity
        await RouterContract.addLiquidity(address_1.address, ethAmount, spcAmount, ethAmount, spcAmount, {value: ethAmount});
        expect(await PoolContract.balanceOf(address_1.address)).to.not.equal(0);

        // swap
        let spcAmountIN = ethers.utils.parseEther("5");
        // expected amount = 1
        // actual amount = 0.91 - 0.01 fee = 0.9
        let ethMinimum = ethers.utils.parseEther("0.9");

            // calculate the amount we are getting back
            let reserveETH = await PoolContract.reserveETH();
            let reserveSPC = await PoolContract.reserveSPC();

            //let quote = await RouterContract._calculateExpectedAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Expected Amount: ' + ethers.utils.formatEther(quote));

            //let actualAmount = await RouterContract._calculateActualAmount(spcAmountIN, reserveSPC, reserveETH);
            //console.log('Actual Amount: ' + ethers.utils.formatEther(actualAmount));

        await SpaceCoinContract.connect(address_2).approve(RouterContract.address, spcAmountIN);
        expect(await SpaceCoinContract.allowance(address_2.address, RouterContract.address)).to.equal(spcAmountIN);

        await expect(RouterContract.connect(address_2).swapTokens(address_2.address, 0, spcAmountIN, ethMinimum)).to.not.be.reverted;
      });
    });
  });