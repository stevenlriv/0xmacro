// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ICO {
    bool public isICOEnable = false;
    uint256 public totalContributed;

    /// these are the limits allow to investors in different phases
    /// general and open the same hard cap is enforced
    uint256 public constant TOKENS_PER_ETH = 5;
    uint256 public constant PHASE_SEED_CAP = 15_000 ether;
    uint256 public constant PHASE_SEED_INDIVIDUAL = 1_500 ether;
    uint256 public constant PHASE_GENERAL_OPEN_CAP = 30_000 ether;
    uint256 public constant PHASE_GENERAL_INDIVIDUAL = 1_000 ether;

    /// phases
    /// 0 = phase seed
    /// 1 = phase general
    /// 2 = phase open
    uint256 public currentPhase = 0;

    mapping(address => bool) public seedInvestors;
    mapping(address => uint256) public contributionsByAddress;
    mapping(address => uint256) public claimableContributionsByAddress;

    address public tokenAddress;

    /// used to block non-owners from calling some functions
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "ICO: Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// investors can contribute here depending on the phase that we are in
    /// first seed investors, then general and then open
    /// we perform all checks, and then accept the contribution
    /// in phase 2 we should directly send the tokens to the contributors
    function contribute() external payable {
        require(msg.value > 0, "ICO: Send some ETH to the contract");
        require(isICOEnable, "ICO: Must be active");
        require(totalContributed + msg.value <= PHASE_GENERAL_OPEN_CAP, "ICO: Can't go above hardcap of 30k ETH");

        if(currentPhase == 0) {
            require(seedInvestors[msg.sender], "ICO: You are not in the allow list for seed investors");
            require(totalContributed + msg.value <= PHASE_SEED_CAP, "ICO: Can't go above hardcap of 15k ETH for seed");
            require(contributionsByAddress[msg.sender] + msg.value  <= PHASE_SEED_INDIVIDUAL, "ICO: Can't go above individual amount of 1_500 ETH");
        }
        else if(currentPhase == 1) {
            require(contributionsByAddress[msg.sender] + msg.value  <= PHASE_GENERAL_INDIVIDUAL, "ICO: Can't go above individual amount of 1_000 ETH");
        }

        uint256 amount = msg.value;
        totalContributed = totalContributed + amount;
        contributionsByAddress[msg.sender] = contributionsByAddress[msg.sender] + amount;
        claimableContributionsByAddress[msg.sender] = claimableContributionsByAddress[msg.sender] + amount;
        
        /// send the tokens directly if in last phase
        if(currentPhase == 2) {
            claimTokens();
        }

        emit NewContribution(msg.sender, amount, currentPhase);
    }

    /// investors can only start claiming tokens in the open phase
    function claimTokens() public {
        require(currentPhase == 2, "ICO: Open Phase has not yet been reached");
        require(claimableContributionsByAddress[msg.sender] > 0, "ICO: You have no tokens to claim");

        uint256 amount = claimableContributionsByAddress[msg.sender] * TOKENS_PER_ETH;
        claimableContributionsByAddress[msg.sender] = 0;
        
        require(ERC20(tokenAddress).transfer(msg.sender, amount), "ICO: failed to send tokens");

        emit TokensClaimed(msg.sender, amount);
    }

    /// the owner is can move forward with phases
    /// this will stop working at the last phase which is phase open
    function progressPhases(uint256 _nextPhase) external onlyOwner {
        require(currentPhase != 2, "ICO: Phases completed");

        if(currentPhase == 0) {
            require(_nextPhase == 1, "ICO: Phase can only move forward");
        }
        else if(currentPhase == 1) {
            require(_nextPhase == 2, "ICO: Phase can only move forward");
        }

        currentPhase = currentPhase + 1;

        emit NewPhase(currentPhase);
    }

    /// add seed investors to the ICO 
    function addSeedInvestors(address _address) external onlyOwner {
        seedInvestors[_address] = true;
    }

    /// enable/disable the ICO smart contract
    function enableDisableICO() external onlyOwner {
        isICOEnable = !isICOEnable;
    }

    /// one time only to set the token contract address
    function setTokenContract(address _address) external onlyOwner {
        require(tokenAddress == address(0), "ICO: Token address was already set");

        tokenAddress = _address;
    }

    function withdraw(address _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "ICO: enter a lower amount to withdraw");

        (bool success, ) = _to.call{ value: _amount }("");
        require(success, "ICO: withdraw failed");

        emit Withdraw(_to, _amount);
    }

    event NewContribution(address indexed investor, uint256 etherAmount, uint256 indexed currentPhase);
    event NewPhase(uint256 indexed currentPhase);
    event TokensClaimed(address indexed claimingAddress, uint256 tokenAmount);
    event Withdraw(address indexed addressSent, uint256 ethAmount);
}