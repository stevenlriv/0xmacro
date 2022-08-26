// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface NftMarketplace {
    function getPrice(address nftContract, uint nftId) external returns (uint price);
    function buy(address nftContract, uint nftId) external payable returns (bool success);
}

contract DAO {
    string public constant DAPP_NAME = "DAO";
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,uint256 vote, uint256 nonce)");

    uint256 public constant REQUIRED_CONTRIBUTION = 1 ether;
    uint256 public constant REQUIRED_QUORUM_PERCENTAGE = 25;
    uint256 public constant PROPOSAL_ACTIVE_PERIOD = 7 days;

    /// these are mappings concerning the dao members
    /// we can track their last proposal and that way we can check the status to see if they
    /// can do a new one, only 1 proposal active per member
    /// we can also track if they have voted in a proposal
    uint256 public daoMembersCount;
    mapping(address => uint256) public nonces;
    mapping(address => bool) public daoMembers;
    mapping(address => uint256) public daoMembersLastProposals;

    /// mappings that records proposals votes and creation time
    /// and proposal status
        /// 1 = active
        /// 2 = passed
        /// 3 = failed
    /// for proposal votes
        /// 1 = yes
        /// 2 = no
    mapping(uint256 => uint256) public proposalStatus;
    mapping(uint256 => uint256) public proposalTimestamp;
    mapping(uint256 => uint256) public proposalVotesCount;
    mapping(uint256 => uint256) public proposalVotesCountYes;
    mapping(uint256 => uint256) public proposalVotesCountNo;
    mapping(uint256 => mapping(address => uint256)) public proposalVotes;
    mapping(uint256 => bool) public proposalExecuted;

    struct ProposalData {
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string description;
    }
    mapping(uint256 => ProposalData) public proposals;

    uint256 private unlocked = 1;
    modifier reentrancy() {
        require(unlocked == 1, 'DAO: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    /// dao members can contribute to join the dao
    function contribute() external payable {
        require(!daoMembers[msg.sender], "DAO: Already a member of a DAO");
        require(msg.value == REQUIRED_CONTRIBUTION, "DAO: Needs to contribute 1 ETH");

        daoMembers[msg.sender] = true;
        daoMembersCount++;

        emit NewMember(msg.sender, daoMembersCount);
    }

    function newProposal(address[] calldata targets, uint256[] calldata values, bytes[] calldata calldatas, string calldata description) external {
        require(daoMembers[msg.sender], "DAO: Needs to be a member");
        require(proposalStatus[daoMembersLastProposals[msg.sender]] != 1, "DAO: Only one proposal at a time");

        uint256 proposalId = hashProposal(targets, values, calldatas, description);

        require(proposalStatus[proposalId] == 0, "DAO: Proposal already exists");

        /// lets set the proposal id to the dao member
        daoMembersLastProposals[msg.sender] = proposalId;

        /// set the proposal time stamp and status active
        proposalTimestamp[proposalId] = block.timestamp;
        proposalStatus[proposalId] = 1;

        /// store proposal data on-chain
        proposals[proposalId] = ProposalData(targets, values, calldatas, description);

        emit NewProposal(msg.sender, proposalId, targets, values, calldatas, description);
    }

    function voteNoSignature(uint256 proposalId, uint256 vote) external {
        _voteProposal(proposalId, msg.sender, vote);
    }

    function voteBySignature(uint256 proposalId, uint256 vote, uint256 nonce, uint8 v, bytes32 r, bytes32 s) public {
        // we hash the ballot type, proposal id and vote (yes =1 or no =2)
        bytes32 encodedVote = keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, vote, nonce));

        // we make sure to tie it to this dao and contract address
        bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(DAPP_NAME)), block.chainid, address(this)));

        // we replicate the full signature
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, encodedVote));

        // we verify is the right private key that signed
        address signatory = ecrecover(digest, v, r, s);

        require(signatory != address(0), "DAO: Member needs to sign transaction with his private key");

        _voteProposal(proposalId, signatory, vote);
    }

    function bulkVoteBySignature(uint256 proposalId, uint256[] calldata vote, uint256[] calldata nonce, uint8[] calldata vs, bytes32[] calldata rs, bytes32[] calldata ss) external {
        require(vote.length == vs.length, "DAO: Invalid signature lenght (vote vs vs)");
        require(vote.length == rs.length, "DAO: Invalid signature lenght (vote vs rs)");
        require(vote.length == ss.length, "DAO: Invalid signature lenght (vote vs ss)");
        require(vote.length == nonce.length, "DAO: Invalid signature lenght (vote vs nonce)");

        for (uint i = 0; i < vote.length; i++) {
            voteBySignature(proposalId, vote[i], nonce[i], vs[i], rs[i], ss[i]);
        }
    }
    /// members votes are immutable
    function _voteProposal(uint256 proposalId, address _daoMemeberAddr,  uint256 vote) internal {
        require(daoMembers[_daoMemeberAddr], "DAO: Needs to be a member");
        require(proposalStatus[proposalId] == 1, "DAO: Proposal must be active");
        require(block.timestamp <= proposalTimestamp[proposalId] + PROPOSAL_ACTIVE_PERIOD, "DAO: 7 days of active voting period ended");
        require(proposalVotes[proposalId][_daoMemeberAddr] == 0, "DAO: Only 1 vote per member");
        require(vote == 1 || vote == 2, "DAO: Only yes (1) or no (2) votes accepted");

        proposalVotesCount[proposalId]++;
        proposalVotes[proposalId][_daoMemeberAddr] = vote;

        if(vote==1) {
            proposalVotesCountYes[proposalId]++;
        }
        else if(vote==2) {
            proposalVotesCountNo[proposalId]++;
        }

        emit NewVote(_daoMemeberAddr, proposalId, vote);
    }

    /// quorum has to be by 25% of the voters
    /// we use dao members count and proposal votes count
    /// even new dao members are part of the quorum due to spec
    function isQuorum(uint256 proposalId) public view returns(bool) {
        uint256 totalVotes = proposalVotesCount[proposalId];

        if(totalVotes * 4 >= daoMembersCount) {
            return true;
        }
        else {
            return false;
        }
    }

    /// we have a semi-automated proccess for now
    /// only after the voting period ends
    function executeProposal(uint256 proposalId) external reentrancy {
        require(!proposalExecuted[proposalId], "DAO: Proposal was already executed");
        require(daoMembers[msg.sender], "DAO: Needs to be a member");
        require(block.timestamp > proposalTimestamp[proposalId] + PROPOSAL_ACTIVE_PERIOD, "DAO: 7 days of active voting still in progress");

        proposalExecuted[proposalId] = true;

        // we verify quorum is met and that we have more yes votes than no votes
        // if not we fail the execution
        if(isQuorum(proposalId) && proposalVotesCountYes[proposalId]>proposalVotesCountNo[proposalId]) {
            /// proposal is success
            proposalStatus[proposalId] = 2;

            // we proccess the arbitrary functions calls
            for (uint256 i = 0; i < proposals[proposalId].targets.length; ++i) {
                (bool success, ) = proposals[proposalId].targets[i].call{value: proposals[proposalId].values[i]}(proposals[proposalId].calldatas[i]);

                require(success, "DAO: Call failed");
            }
        }
        else {
            /// proposal failed to pass
            proposalStatus[proposalId] = 3;
        }

        emit NewExecutedProposal(proposalId, proposalStatus[proposalId]);
    }

    function hashProposal(
        address[] memory targets,
        uint[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public pure virtual returns (uint256) {
        return uint256(keccak256(abi.encode(targets, values, calldatas, keccak256(bytes(description)))));
    }

    function buyNFTFromMarketplace(address nftContract, uint256 nftId, uint256 maxPrice) public returns(bool) {
        require(msg.sender == address(this), "DAO: Only DAO Contract can call this function");

        /// example address as this is a non-live interface snipet of a imaginary smart contract
        if(NftMarketplace(0xC627257eA77eD6B467D4376D237Bce8acB816C91).getPrice(nftContract, nftId) <= maxPrice && address(this).balance >= maxPrice) {
            if(NftMarketplace(0xC627257eA77eD6B467D4376D237Bce8acB816C91).buy(nftContract, nftId)) {
                emit NewNFTPurchase(nftContract, nftId);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    event NewMember(address indexed daoMember, uint256 memberNumber);
    event NewProposal(address indexed daoMember, uint256 proposalId, address[] targets, uint256[] values, bytes[] calldatas, string description);
    event NewVote(address indexed daoMember, uint256 proposalId, uint256 vote);
    event NewExecutedProposal(uint256 proposalId, uint256 status);
    event NewNFTPurchase(address indexed nftContract, uint256 nftId);
}