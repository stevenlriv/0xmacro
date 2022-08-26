# Crowdfund Project

## Technical Spec
<!-- Here you should list the technical requirements of the project. These should include the points given in the project spec, but will go beyond what is given in the spec because that was written by a non-technical client who leaves it up to you to fill in the spec's details -->
- The smart contract is reusable; multiple projects can be registered and accept ETH concurrently.
  - Specifically, you should use the factory contract pattern.
- The goal is a preset amount of ETH.
  - This cannot be changed after a project gets created.
- Regarding contributing:
  - The contribute amount must be at least 0.01 ETH.
  - There is no upper limit.
  - Anyone can contribute to the project, including the creator.
  - One address can contribute as many times as they like.
  - No one can withdraw their funds until the project either fails or gets cancelled.
- Regarding contributer badges:
  - An address receives a badge if their total contribution is at least 1 ETH.
  - One address can receive multiple badges, but should only receive 1 badge per 1 ETH.
  - Each project should use its own NFT contract.
- If the project is not fully funded within 30 days:
  - The project goal is considered to have failed.
  - No one can contribute anymore.
  - Supporters get their money back.
  - Contributor badges are left alone. They should still be tradable.
- Once a project becomes fully funded:
  - No one else can contribute (however, the last contribution can go over the goal).
  - The creator can withdraw any amount of contributed funds.
- The creator can choose to cancel their project before the 30 days are over, which has the same effect as a project failing.

## Design Exercise Answer
<!-- Answer the Design Exercise. -->
<!-- In your answer: (1) Consider the tradeoffs of your design, and (2) provide some pseudocode, or a diagram, to illustrate how one would get started. -->
> Smart contracts have a hard limit of 24kb. Crowdfundr hands out an NFT to everyone who contributes. However, consider how Kickstarter has multiple contribution tiers. How would you design your contract to support this, without creating three separate NFT contracts?

You can work around this using NFT metadata on IPFS and every URI can have certain data and specs depending on the contributions, etc

SMART CONTRACT => URI standard in ERC721 => JSON IN IPFS

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
```
