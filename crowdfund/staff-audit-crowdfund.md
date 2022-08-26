https://github.com/0xMacro/student.stevenlriv/tree/44b0b1bb029de24f81ebf5ca8739604934ad4db5/crowdfund

Audited By: Vince


# General Comments

Great submission! The code is very easy to read and understand. There aren't any major vulnerabilties, just a couple of simple gas optimizations. Definitely worth getting more experience testing with mocha and chai (javascript/typescript frameworks). 


# Design Exercise

The design proposed is very simple and effective. One argument that one could make is that by relying on the tier to be an off-chain information you prevent building other contracts that might rely on the tier to apply specific pieces of business logic.


# Issues

**[Technical Mistake-1]** Incorrect accounting of contributed amount means funding goal is reached earlier than it should be

In line 45 of Project.sol, You perform the following check:

`if (msg.value + address(this).balance >= fundingGoal)`

This check is not correct, though, because `address(this).balance` has already been updated with the amount sent to it with `msg.value`. So for instance, if a contract has a balance of 1 ETH, and an address sends 0.5 ETH to it, then in the beginning of `receive` (or any function marked as `payable`) the value of `address(this).balance` will be 1.5 ETH.

Consider line 45 to only compare `address(this).balance` against the `fundingGoal`

**[G-1]** Remove unused storage variables

In `ProjectFactory`, the storage variable `creatorAndProjects` is redundant, consider to remove to save some gas.

**[G-2]** Use `immutable` for non changing storage variables

In `Project`, the variables `endTime`, `fundingGol` and `owner` are set in the constructor and never changed later. Consider to use `immutable` to save some gas.

**[G-3]** minting a single NFT can be gas inefficient

The method `Project::mintNFT()` mints one NFT at a time. For a major contributor it can be a very expensive operation to mint their NFT one by one. Consider exposing a bulk minting method.

**[G-4]** use new `error` keyword over string error message


**[Q-1]** emit events for state mutating functions

Consider emitting event for the following cases:
- NFT minted in `Project::mintNFT()`
- Project canceled in `Project::cancel()`

**[Q-2]** Use NatSpec format for comments
Solidity contracts can use a special form of comments to provide rich 
documentation for functions, return variables and more. This special form is 
named the Ethereum Natural Language Specification Format (NatSpec).

It is recommended that Solidity contracts are fully annotated using NatSpec 
for all public interfaces (everything in the ABI).

Using NatSpec will make your contracts more familiar for others to audit, as well
as making your contracts look more standard.

For more info on NatSpec, check out [this guide](https://docs.soliditylang.org/en/develop/natspec-format.html).

Consider annotating your contract code via the NatSpec comment standard.

**[Q-2]** Needless unused storage variables

`ProjectFactory.projects` and `ProjectFactory.creatorAndProjects` is not used in any contract, and can be calculated using offchain indexers. It costs thousands of gas to perform the SSTORES in lines 16 and 17.

Consider removing those storage variables, and reducing the gas cost of your Project deploy


# Nitpicks

- Consider renaming the storage variable named `isClosed` to `isFunded/isFullyFunded` as close can be misinterpreted while funded/fully funded tells that the project has reached the target.


# Score

| Reason | Score |
|-|-|
| Late                       | - |
| Unfinished features        | - |
| Extra features             | - |
| Vulnerability              | - |
| Unanswered design exercise | - |
| Insufficient tests         | 2 |
| Technical mistake          | 1 |

Total: 3

Great job!
