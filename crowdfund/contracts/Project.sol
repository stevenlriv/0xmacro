//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Project is ERC721 {
    event Contribution(address indexed from, address indexed project, uint256 amount);
    event Refund(address indexed to, address indexed project, uint256 amount);
    event Withdraw(address indexed to, address indexed project, uint256 amount);

    bool public isClosed = false;
    bool public isCancelled = false;

    uint256 public endTime;
    uint256 public fundingGoal;
    uint256 public tokenIds;
    uint256 public constant MINIMUM_CONTRIBUTION = 0.01 ether;

    string public description;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    mapping(address => uint256) public addressAndContributions;
    mapping(address => uint256) public addressAndMintedNFTs;

    constructor(string memory _name, string memory _tokenSymbol, string memory _description, uint256 _fundingGoal, address _creator) ERC721(_name, _tokenSymbol) {
        owner = _creator;
        endTime = block.timestamp + 30 days;

        description = _description;
        fundingGoal = _fundingGoal;
    }

    receive() external payable {
        require(!isClosed, "Project: project has been closed");
        require(!isCancelled, "Project: project has been cancelled");
        require(block.timestamp < endTime, "Project: project expired");
        require(msg.value >= MINIMUM_CONTRIBUTION, "Project: contribution must be more or equal to 0.01 ether");

        if (msg.value + address(this).balance >= fundingGoal) {
            isClosed = true;
        }

        addressAndContributions[msg.sender] += msg.value;

        emit Contribution(msg.sender, address(this), msg.value);
    }

    function refund() external {
        require(isCancelled || (block.timestamp >= endTime && !isClosed), "Project: cannot refund");
        require(addressAndContributions[msg.sender] > 0, "Project: address has no contributions");

        uint256 addressContributions = addressAndContributions[msg.sender];
        addressAndContributions[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{ value: addressContributions }("");
        require(success, "Project: refund failed");

        emit Refund(msg.sender, address(this), addressContributions);
    }

    function mintNFT() external {
        require(addressAndMintedNFTs[msg.sender] < addressAndContributions[msg.sender] / 1 ether, "Project: No available NFTs to mint for that address");
        addressAndMintedNFTs[msg.sender] += 1;

        _safeMint(msg.sender, tokenIds);

        tokenIds += 1;
    }

    function cancel() external onlyOwner {
        require(!isCancelled, "Project: project is cancelled");
        require(!isClosed, "Project: project has finished");
        require(block.timestamp < endTime, "Project: time limit for project expired");

        isCancelled = true;
    }

    function withdraw(uint256 _amount) external onlyOwner {
        require(isClosed, "Project: project is still live");
        require(_amount <= address(this).balance, "Project: enter a lower amount to withdraw");

        (bool success, ) = msg.sender.call{ value: _amount }("");
        require(success, "Project: withdraw failed");

        emit Withdraw(msg.sender, address(this), _amount);
    }
}
