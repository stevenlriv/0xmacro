# ICO Project

## Technical Spec
<!-- Here you should list the technical requirements of the project. These should include the points given in the project spec, but will go beyond what is given in the spec because that was written by a non-technical client who leaves it up to you to fill in the spec's details -->
The SpaceCoin Token 
- 500,000 max total supply
- A 2% tax on every transfer. The taxed SPC should go to the treasury* account
    - A flag that toggles this tax on/off, controllable by owner, initialized to false
    - *The treasury account should be a simple address variable. 
- token symbol "SPC"

The ICO Contract
- if contribution goes over 30k revert transaction. Max raise of 30k ETH
- The owner of the contract should have the ability to pause and resume fundraising at any time, [x] - as well as move a phase forwards (but not backwards) at will.
- [phase seed] private investor round require them to be in an allowlist
    - maximum contribution for this phase is 15k ETH
    - with individual contribution of 1,500 each
- [phase general] general public round
    - maximum contribution of 30k including the private round cointribution
    - individual contribution limit of 1,000 ETH
- [phase open] open phase
    - maximum contribution sill 30k
    - no individual limit
    - the ico contract should release SpaceCoin tokens at an exchange rate of 5 tokens to 1 ETH
- if individual limit is met, cant participate in other phases
- on public sale all users can take their tokens
- maximum tokens on sale 150k (5x1 ETH)

## Design Exercise Answer
<!-- Answer the Design Exercise. -->
<!-- In your answer: (1) Consider the tradeoffs of your design, and (2) provide some pseudocode, or a diagram, to illustrate how one would get started. -->
> The base requirements give contributors their SPC tokens immediately. How would you design your contract to vest the awarded tokens instead, i.e. award tokens to users over time, linearly?

ANSWER:

So for this there has to be some type of time tracking. You could track the amount they contributed and at at which time using block.timestamp. From there we can create a claim function. They user will vest their tokens over time and the function will allow them to claim whats vested until that moment. Maybe every 30 days they are able to claim like a 10% amount. Every time they claim you keep a counter of how much they have left to claim and how much is available to claim right now.

## Testnet Deploy Information

| Contract | Address Etherscan Link |
| -------- | ------- |
| SpaceCoin | `https://rinkeby.etherscan.io/address/0x6cfffa0db9f8a4157cf60a23bde2ee1b043733b3#code` | 
| ICO | `https://rinkeby.etherscan.io/address/0x3b43fc418f0cd06e647f565f58912e54a90e1107#code` | 

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
