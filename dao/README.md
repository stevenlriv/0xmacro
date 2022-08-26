# DAO Project

## Voting System Explaination

In this project the voting system approach is a quorum approach, were each user is given 1 vote per address that contibuted 1 ETH.

It does not matters if you just joined the DAO you can vote on any open proposal and the quorum calculations will rebalance to account for the new member that joined.

You need 25% of quorum to pass a proposal. 

Quorum method is harder, but represents could potentially representative the vote of the DAO as close to what the people want.

## Technical Spec
<!-- Here you should list your DAO specification. You have some flexibility on how you want your DAO's voting system to work and Proposals should be stored, and you need to document that here so that your staff micro-auditor knows what spec to compare your implementation to.  -->

### Proposal System Spec

* Example: Two or more identical proposals may not be active at the same

- [x] Allow members to propose any NFT to buy
- [x] This proposal system should support calling arbitrary functions
- [x] When a proposal is passed, the NFT should be purchased in the most automated way possible (buyNFTFromMarketplace = one of the arbitrary functions; call NFT markets functions)
- [x] 1 proposal active per address/member
- [x] data of proposal will be stored on chain

### Voting System Spec

* Example: 25% Quorum, where quorum is defined as _____.

- [x] For members to vote and be part of the DAO they have to buy in with 1 ETH (whitelist)
- [x] Allow members to vote on proposals
- [x] A passing vote needs a 25% quorum (quorum is reached by amount of members)
- [x] One function that accepts validation and writes single vote signatures
- [x] 1 vote per address/member
- [x] members are not allowed to change their vote, vote are immutable
- [x] there is a voting period of 7 days before passing a proposal
- [x] quorum is calculated using the number of members that are currently part of the DAO, meaning that if you just joined, you can vote and the quorum equation gets rebalanced
- [x] members can cast votes of yes and no only

## Design Exercise Answer
<!-- Answer the Design Exercise. -->
<!-- In your answer: (1) Consider the tradeoffs of your design, and (2) provide some pseudocode, or a diagram, to illustrate how one would get started. -->
> Per project specs there is no vote delegation; it's not possible for Alice to delegate her voting power to Bob, so that when Bob votes he does so with the voting power of both himself and Alice in a single transaction. This means for someone's vote to count, that person must sign and broadcast their own transaction every time. How would you design your contract to allow for non-transitive vote delegation?

- You can design your contract to allow for non-transitive vote delegation creating an mapping where there can only the user delegate to one person. This mapping will track the user address and to which address he is delegating his vote. This way only the original user can delegate that power. For example:
- A ==Delegates=> B (a mapping: address => address is registered that A delegated to B; we increase the B voting power by +1 to a maping that tracks address voting power: address => uint256)
- B ==Delegates=> C (a mapping: address => address is registered that B delegated to C; we increase the C voting power by +1 and decrease the voting power of B by -1 to a maping that tracks address voting power: address => uint256)
- B only delegated his vote, not A vote, because A vote is delegated to B and not C according to the mapping.
- In this Example A will have 0 votes; B will have 1 votes, due to A delegation and C will have 2 votes, his vote + B vote.

> What are some problems with implementing transitive vote delegation on-chain? (Transitive means: If A delegates to B, and B delegates to C, then C gains voting power from both A and B, while B has no voting power).

- Transitive delegations creates concentration of power in a smaller amount of people diminishing the decentralized factor of a DAO and might look a bit undemocratic
- As per to implementing transitive vote delegation on-chain some of the problems presented are more from the cost of it, users will have to spend gas fees to delegate their votes and to revoke that delegation

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
