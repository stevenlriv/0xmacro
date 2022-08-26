# LP Project

## Technical Spec
<!-- Here you should list the technical requirements of the project. These should include the points given in the project spec, but will go beyond what is given in the spec because that was written by a non-technical client who leaves it up to you to fill in the spec's details -->

Frontend
- LP Management
- [x] Allow users to deposit ETH and SPC for LP tokens (and vice-versa)
- Trading
- [x] Allow users to trade ETH for SPC (and vice-versa)
- [x] Configure max slippage
- [x] Show the estimated trade value they will be receiving

ERC-20 & ICO Updates
- [x] Add a withdraw function to your ICO contract that allows you to move the invested funds out of the ICO contract and into the treasury address.
- [x] In one of your tests, test the end-to-end process of raising funds via the ICO, withdrawing them to the treasury, and then depositing an even worth of ETH and SPC into your liquidity contract.

Liquidity Pool Contract
- [x] Write an ERC-20 contract for your pool's LP tokens
- Write a liquidity pool contract that:
- [x] Mints LP tokens for liquidity deposits (ETH + SPC tokens)
- [x] Burns LP tokens to return liquidity to holder
- [x] Accepts trades with a 1% fee

SpaceRouter
- Transferring tokens to an LP pool requires two transactions:
- 1. Trader grants allowance on the Router contract for Y tokens.
- 2. Trader executes a function on the Router which pulls the funds from the Trader and transfers them to the LP Pool.
- Write a router contract to handles these transactions. Be sure it can:
- [x] Add liquidity
- [x] Remove liquidity
- [x] Swap tokens, rejecting if the slippage is above a given amount. You do not have to take the 2% SPC tax into account when calculating slippage.

## Design Exercise Answer
<!-- Answer the Design Exercise. -->
<!-- In your answer: (1) Consider the tradeoffs of your design, and (2) provide some pseudocode, or a diagram, to illustrate how one would get started. -->

> How would you extend your LP contract to award additional rewards – say, a separate ERC-20 token – to further incentivize liquidity providers to deposit into your pool?

This is an interesting perspective and can even be applied some concepts from a tokenomics (even P2E point of view). We already have an LP token that manages the IOU of our SPC/ETH pair. But we can create another governance/incentivation token to incentive user to provide liquidity.

Compound and AAVE and everyone during the 2020 DEFI summer did this, some web3 games also do this and even L2 when launching their services they start a community farming operation.

To do this we will have to:
- create a new token and maybe add some sort of utility like a burning mecanism to control the supply mint
- from there depending on the weight of the pool (you can create a function to calculate this user lp tokens/total lp tokens) and the amount of time you have been providing liquidity (using block.timestamp) the user will be rewarded; nothing that dificult
- the LP contract might hold those new created tokens and/or might mint them depending on the needs
- from there you can create an UI and the user can claim it every month or every week calling the lp contract function like claimYourLPRewards, etc

The problem with this approach is the inflationary aspect of the token being farmed, but usually thats what happened with most projects during the Defi summer they inflaited their token base to incentivice people to use their protocols and or provide liquidity.

Note: The treasury have SPC tokens, so another approach is for the to allocate a part of those tokens to incentivize liquidity providers.

## Testnet Deploy Information

| Contract | Address Etherscan Link |
| -------- | ------- |
| SpaceCoin | https://rinkeby.etherscan.io/address/0xec49Ea39f6B6A3dD9C606Ed33E590e8d9402Fb9d |
| ICO | https://rinkeby.etherscan.io/address/0x0AE8374b9fEe8FabF35a43cc23A31A9d2a2bC4F3 |
| Router | https://rinkeby.etherscan.io/address/0xe0113FBe637116729e554CC76b95EB830DcE498b |
| Pool | https://rinkeby.etherscan.io/address/0xf72bC522601e439E7F979809d380A12E8149aca6 |

## Useful Commands

Try running some of the following commands:

```shell
npx hardhat help
npx hardhat compile              # compile your contracts
npx hardhat test                 # run your tests
npm run test                     # watch for test file changes and automatically run tests
npx hardhat coverage             # generate a test coverage report at coverage/index.html
GAS_REPORT=true npx hardhat test # run your tests and output gas usage metrics
npx hardhat node                 # spin up a fresh in-memory instance of the Ethereum blockchain
npx prettier '**/*.{json,sol,md}' --write # format your Solidity and TS files

npx hardhat run --network rinkeby scripts/[contractName].ts
npx hardhat verify --network rinkeby DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
```