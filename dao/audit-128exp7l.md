# General Comments

I would like to say:
- good effort on designing and implementing this DAO project, along with other commitments
- good job that the code is generally concise
 
On the improvement side, I would recommend considering:
- checking all write accesses and determine the right privilege for each in the design
- test rigorously, currently there is no test at all. Specifically
  - to find out unspecified details in the design, and gather info and remove ambiguity with the help from staff
  - to make sure the implementation closely matching the design

# H-1 Voting does not account for voters' decisions

L109
```
        if(isQuorum(proposalId)) {
            /// proposal is success
            proposalStatus[proposalId] = 2;

            /// lets simulate that the proposal data is asking for an NFT purchase
            /// so we take the pertinent values as per imaginary DAO documentation requirements to submit proposal
            address nftContract = proposals[proposalId].targets[0];
            uint256 nftId = proposals[proposalId].values[0];

            buyNFTFromMarketplace(nftContract, nftId);
        }
```

Though accounting for voters' decision is not in your or the provided spec, I think that the voting should account for 'YES'/'NO'.

Current design opens up the possibility, where all members voted for 'NO', but an attacker can still execute the proposal.

Consider accounting for 'YES'/'NO' majority to approve the proposal, after reaching quorum.

# H-2 Signature can be misused in other contexts

L147
```
        bytes32 messageHash = keccak256(abi.encodePacked(_message, _nonce));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
```

The signature for a vote should at least include as input:
- nonce (avoid an attacker replaying the same transaction)
- proposal ID (avoid an attacker using the signature of proposal 1 for proposal 2)
- dapp's address (avoid an attacker using the signature for dapp 1 for dapp 2)

Currently, the signature verification only verifies the nonce, making the signer vulnerable to at least the misuses above.

Consider complying with [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signing scheme.

# H-3 Vulnerable to re-entrance attack

L109
```
        if(isQuorum(proposalId)) {
            /// proposal is success
            proposalStatus[proposalId] = 2;

            /// lets simulate that the proposal data is asking for an NFT purchase
            /// so we take the pertinent values as per imaginary DAO documentation requirements to submit proposal
            address nftContract = proposals[proposalId].targets[0];
            uint256 nftId = proposals[proposalId].values[0];

            buyNFTFromMarketplace(nftContract, nftId);
        }
        else {
            /// proposal failed to pass quorum
            proposalStatus[proposalId] = 3;
        }

```

When the control flow is passed to an external contract, there is no check in `executeProposal` that the proposal is executing, so an attacker can
re-enter and execute `executeProposal` again, to e.g. send ETH.

Consider:
- using a mapping to keep track of executed proposals
- only execute proposals not yet executed
- use Check-Effect-Interaction pattern

# H-4 A proposal's status and voting period can be reset by attacker

L64
```
        /// set the proposal time stamp and status active
        proposalTimestamp[proposalId] = block.timestamp;
        proposalStatus[proposalId] = 1;
```

Attacker can postpone voting's ending and re-open voting, by calling `newProposal` for an already-created proposal, since there is no check against
recreating a proposal.

Consider checking if the proposal is already created e.g. using creation timestamp.

# H-5 Reserve draining through `buyNFTFromMarketplace`

L128
```
    function buyNFTFromMarketplace(address nftContract, uint nftId) private returns(bool) {
```

There should be protection against `getPrice` from increasing to drain the DAO's reserve.

The NFT marketplace operator can increase the output of `getPrice`, right before the proposal is executed.

Since the current implementation only relies on the output to decide the payment, the marketplace operator can increase up to the reserve balance and receive all the ETH.

Consider:
- making a proposal specify a maximum price to lower the extractable amount of ETH
- using `{value: someValue}.buy` to send ETH

# H-6 Missing implementation for signature bulk upload 

From [Project Spec](https://learn.0xmacro.com/training/project-dao/p/1):

> Write a function that allows any address to count a DAO member's vote using offchain-generated signatures. Then, write a function to do this in bulk.

There should be implementation for uploading multiple signatures. 

Consider adding the implementation.

# H-7 Missing implementation for arbitrary function execution

From [Project Spec](https://learn.0xmacro.com/training/project-dao/p/1):

> Implement a proposal system that calls arbitrary functions.

The implementation is supposed to able to execute a proposal that can contain arbitrary function calls to make.

Specifically, a proposal is defined by: `targets` (list of contract addresses), `values` (list of Ether values to send), and `calldatas` (list of messages to send).

Consider:
1. adding the implementation
1. checking the lengths for argument arrays to be the same
1. making `buyFromMarketplace` public or external so it is callable in an external contract call
1. to only allow the DAO contract to call `buyFromMarketplace`
   1. because if `buyFromMarketplace` was public and an attacker can call it, the attacker can call `buyFromMarketplace` to withdraw ETH without making an approved proposal

# H-8 Membership count does not correspond to the number of unique addresses

From your spec, a member is defined as an address having paid 1 ETH. 
> - [x] For members to vote and be part of the DAO they have to buy in with 1 ETH (whitelist)
> - [x] A passing vote needs a 25% quorum (quorum is reached by amount of members)
> - [x] 1 vote per address/member

L45
```
        require(msg.value >= REQUIRED_CONTRIBUTION, "DAO: Needs to contribute 1 ETH");

        daoMembers[msg.sender] = true;
        daoMembersCount++;
```

Currently, an address can `contribute` multiple times,and increment membership count. 

This opens up the possibility for a set of griefing attacks, where attacker manipulate the membership count to corrupt voting.

E.g. an attacker address can contribute 95 ETH, and there 5 other honest addresses contribute 5 ETH total and 1 ETH each. The proposal can never reach 25% quorum.

Consider:
- limiting an address to contribute at most once
- limiting a contribution to be exactly 1 ETH, to simplify the UX and accounting

# L-1 `executeProposal` unnecessarily restrict to members only

L105
```
    function executeProposal(uint256 proposalId) external {
```

Once a proposal is approved, anyone should be able to call `executeProposal`, as the proposal doesn't need more approvals. 

Consider allowing anyone to call `executeProposal`, after the proposal is approved. This increases the chances the proposal is executed after approval, even if all members changed their minds after.

# L-2 Unnecessarily rounding down quorum

L91
```
        uint256 quorumRequired = (daoMembersCount * REQUIRED_QUORUM_PERCENTAGE) / 100;
```

The current implementation is rounding down the quorum e.g. if it is 7 for membership count, the current implementation computes 1 for quorum which is less than 25% of 7.

Consider using `*` over `/` to perform an inequality check e.g.:
```
        if(4 * totalVotes >= daoMembersCount) {
```

# Q-1 `proposalVotes`' values can be `bool` instead of `uint256`

L33
```
    mapping(uint256 => uint256) public proposalVotesCount;
```

Since a vote can only be YES/NO, consider using `bool` instead of `uint256` to reduce unnecessary checks i.e.:

L79
```
        require(vote == 1 || vote == 2, "DAO: Only yes (1) or no (2) votes accepted");
```
