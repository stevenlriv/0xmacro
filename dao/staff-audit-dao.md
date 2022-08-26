https://github.com/0xMacro/student.stevenlriv/tree/d789f20d149713bf0359a15fcedde8c8556b6100/dao

Audited By: Brandon Junus

# General Comments

Good job on the DAO project!

Overall, it's clear that you have a firm understanding of DAOs fundementally and how to implement its main features.

I think there might be a couple of issues that may be worth additional clarification:

1. Gas benefit of bulk signatures vote tallying

While you correctly implemented the technical aspects required to verify signatures, your voteProposal function ultimately works just like a normal vote. The main benefit of signatures for use in this DAO is that the signatures may be collected off-chain to fire a single transaction that tallies all the votes and save gas. See my notes in the "Missing Feature" Bulk Signature Vote Tallying for more details

2. The importance of the DAO's ability to call arbitrary functions

executeProposal ultimately fires off "buyNFTFromMarketplace", rather than calling the proposed contract directly, which was part of the project specs. See my notes in "Proposals cannot execute arbitrary functions" for more details

With your current implementation, DAO.sol would not be able to sell the NFT!

The remaining issues are more related to code quality improvements or adding checks to improve the DAO's functionality, which can be easily fixed. Please let me know if you have any questions on this on discord- Junus.

# Design Exercise

Great job on this design exercise! I appreciate your bullet-point formating as it made it easy to understand your ideas.

An additional thought I may add: transitive voting also has an additional issue that may be worth exploring- Imagine a huge DAO implementing transitive delegation with thousands of members. If there's ever a chain of thousands of delegations, running the vote function may result in running out of gas!

# Issues

**[Unfinished Feature]** Bulk Signature Vote Tallying

One main purpose of signature voting is to save gas by allowing off-chain bulk signature vote tallying.

It works a bit like this:

1. DAO member votes by signing a message
2. Signed message is saved to an offchain db (instead of being fired off as a transaction)
3. At the end of the day (or whatever time period), all signed votes are sent as an array to the DAO to be verified and tallied, thereby initiating only one transaction and saving a ton of gas!

**[Technical Mistake]** Quorum math is not correct when there are few DAO members

Because you calculate the quorum using `25 / 100`, Solidity's rounding down mechanism will allow a fewer number of votes than would be expected.

For example, if in the example below we have the following values:
numYes = 2
numNo = 0
totalNumMembers = 10

which is not enough votes for a 25% quorum. Then if we do:

```solidity
const totalVotes = numYes + numNo;
require(totalVotes >= totalNumMembers * 25 / 100, "NO_QUORUM");
```

then the `require` check will pass, because 10 \* 25 == 250, but in Solidity 250 / 100 == 2.

One way to check for 25% quorum that isn't distorted by Solidity's rounding down division is like this:

```solidity
const totalVotes = proposal.numYes + proposal.numNo; // + proposal.numAbstain if you designed your voting system this way

// only the members who joined prior to the proposal creation could be allowed
// to vote
require(totalVotes * 4 >= proposal.votesAllowed, "NO_QUORUM");
```

**[Technical Mistake - 3 points]** Proposals can be executed more than once

Your Proposal execution logic does not contain any check for if a Proposal has already been executed, and so there's nothing stopping an address from calling execute multiple times.

Before executing you need a `require` check which verifies the Proposal has never been executed before.

**[Unfinished Features - 2 points]** Proposals cannot execute arbitrary functions

The requirement to support for arbitrary function calls to implement NFT buying from the NftMarketplace interface has not been covered. Your proposal system only supports NFT buying by suppling the NFT contract address and Nft Id. It should have accepted arbitrary functions set up. Similar to:

```solidity
function executeProposal(
  ...
) {
  ...
  for (uint256 i = 0; i < proposals[proposalID].length; i++) {
    proposals[proposalID].targets[i].call{
      value: proposals[proposalID].values[i]
    }(proposals[proposalID].calldatas[i]);
  }
}

```

## **[Insufficent tests]**

Your tests look like they are related to the ICO project instead of the DAO project!

**[H-1]** Losing proposals can be executed draining funds from the DAO

The function `executeProposal` does not check if the proposal had more up votes than down votes. It just checks that the quorum was met.
This will allow rejected proposals to be executed and thus unwanted NFTs will be purchased.

Consider adding a check to ensure the up votes are greater than the down votes before executing the purchase.

**[H-2]** Voting Signatures verification does not properly verify member's vote

The process of verifying a signature involves re-creating the signature on the solidity side. Your implementation of verifySignature only checks the message and nonce, and does not verify that the message was signed using a given proposal ID and proper vote (yay or nay).

Check out this example for a proper verification process:

```solidity
function tallyVote(SignedVote calldata _signedVote) public {
  // Hash the vote
  bytes32 encodedVote = keccak256(
      abi.encode(
          VOTE_TYPEHASH,
          _signedVote.proposalId,
          _signedVote.support
      )
  );
  // Hash the EIP-712 specific bytestring, domain hash, and the hashed vote.
  bytes32 fullHash = keccak256(
      abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), encodedVote)
  );
  // Recover the voter from our hash
  address voter = ecrecover(
      fullHash,
      _signedVote.v,
      _signedVote.r,
      _signedVote.s
  );
  // Call vote (If the voter is not a member - _vote will revert the tx)
  _vote(_signedVote.proposalId, Support(_signedVote.support), voter);
}
```

**[H-3]** Reentrancy vulerability on execute proposal

Your executeProposal function does not check if a proposal has been executed before calling buyNFTFromMarketplace. A clever user could implement buyNFTFromMarketplace to call executeProposal, which would call buyNFTFromMarketplace again!

Consider adding a check to see if a proposal has been executed before firing off buyNFTFromMarketplace (this would then follow the checks-effects-interactions pattern).

**[L-1]** Non-EOA DAO members cannot vote

Your voting mechanism requires a signature in order to vote. Contracts don't have private keys, therefore are unable to sign signatures.

If a contract becomes a member of your DAO, they wouldn't be able to vote!

Consider splitting your voteProposal function into two functions- a votebySignature and a regular vote function.

**[L-2]** Members may pay more than 1 ETH when joining DAO

In your DAO membership join function, you have a greater-than-or-equal-to check for msg.value. This means a user could accidentally supply something like 10 ETH when joining the DAO, and they would still only buy 1 membership token. In order to prevent this footgun entirely, that check should be a strict equality (==).

**[L-3]** Member can "buy" multiple memberships

Your contribute function does not check if msg.sender is already a member, which means the member can "contribute" again. This adds to the dao's member count without actually adding new members, which can lead to possible griefing in your quorum count.

**[Q-1]** Simplify code using a single proposal struct

Your code currently has multiple mappings of:

```solidity
mapping(uint256 => uint256) public proposalStatus; // proposal ID to status
mapping(uint256 => uint256) public proposalTimestamp; // proposal ID to proposal creation time
mapping(uint256 => uint256) public proposalVotesCount; // proposal ID to total vote counts
mapping(uint256 => mapping(address => uint256)) public proposalVotes; // proposal ID to votes
```

All these mappings are from proposal ID to some data related to the proposal. You could simplify by putting all this proposal data in one struct.

```solidity
struct Proposal {
  status uint256,
  creationTime uint256,
  voteCount uint256,
  votes mapping(address => uint256)
}

mapping(uint256 => Proposal) proposals;
```

Having a single struct to access and update also would save some gas as you wouldn't have to access multiple mappings.

**[Q-2]** Proposal Status could be an Enum

Your code has comments relating to proposal status:

```
/// mappings that records proposals votes and creation time
/// and proposal status
/// 1 = active
/// 2 = passed
/// 3 = failed
```

Instead of having to remember what the values mean, you could just use an enum:

```solidity
enum ProposalStatus {ACTIVE, PASSED, FAILED}
```

Enums are just uints under the hood, so a value of 0 is ProposalStatus.ACTIVE, a value of 1 is ProposalStatus.PASSED, and a value of 2 is ProposalStatus.FAILED

**[Q-3]** Proposal does not need to save target, value or proposedCallData

Storing data on-chain is expensive- we could save quite a bit by keeping target, value or proposedCallData off-chain.

One method of doing this would be to hash the target, value and proposedCallData together and saving that hash as the proposal ID. Voting would work as expected, just pass the ID and your vote (yay or nay). For execution, you would use the same target, value and proposedCallData as arguments. If they correctly hash to the same proposal ID, then we could loop over the target, values and proposedCallData to execute the functions!

Propose example:

```solidity
function propose(
  address[] memory targets,
  uint256[] memory values,
  bytes[] memory calldatas,
  string memory description
) public returns (uint256) {
  checkFunctionLengths(targets, values, calldatas); // make sure target, values, and calldatas arrays are the same length
  uint256 proposalID = hashFunctionExecutions(
      targets,
      values,
      calldatas,
      keccak256(bytes(description))
  );
  ...
}
```

Execute example:

```solidity
function execute(
  address[] memory targets,
  uint256[] memory values,
  bytes[] memory calldatas,
  string calldata description
) external {
  uint256 proposalID = hashFunctionExecutions(
      targets,
      values,
      calldatas,
      keccak256(bytes(description))
  );
  Proposal storage proposalToExecute = proposals[proposalID];
  checkFunctionLengths(targets, values, calldatas);
  proposalToExecute.executed = true;
  for (uint256 i = 0; i < targets.length; i++) {
    (bool success, bytes memory returndata) = targets[i].call{
        value: values[i]
    }(calldatas[i]);
    require(success, "Call failed");
  }
}
```

**[Q-4]** DAO.sol- newProposal arguments can be calldata (instead of memory)

Using the memory keyword in your argument copies the argument into memory. Using the calldata keyword instead just uses data from the transaction without copying. Calldata is immutable, but saves on gas!

See this post for more details:
https://ethereum.stackexchange.com/questions/74442/when-should-i-use-calldata-and-when-should-i-use-memory

# Nitpicks

1. ExecuteProposal has an interesting comment

```
/// an admin must execute the proposal so it can pass/fail
```

This doesn't appear to be the case, as any member can execute!

# Score

| Reason                     | Score |
| -------------------------- | ----- |
| Late                       | -     |
| Unfinished features        | 3     |
| Extra features             | -     |
| Vulnerability              | 12    |
| Unanswered design exercise | -     |
| Insufficient tests         | 3     |
| Technical mistake          | 4     |

Total: 22

Good job!
