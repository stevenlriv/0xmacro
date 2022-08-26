// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SpaceCoin is ERC20 {
    uint256 public constant MAX_SUPPLY = 500_000 * 10**18;
    uint256 public constant ICO_SUPPLY = 150_000 * 10**18;
    uint256 public constant TREASURY_SUPPLY = 350_000 * 10**18;

    bool public isTaxEnable = false;
    uint256 public constant TAX_PERCENTAGE = 2;

    address public treasuryAddress;
    address public icoAddress;

    /// used to block non-owners from calling some functions
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "SpaceCoin: Not owner");
        _;
    }

    /// set the ICO contract address and the treasury address
    /// mint tokens and send them to the ICO contract
    /// set the contract owner
    constructor(address _icoAddress, address _treasuryAddress) ERC20("SpaceCoin", "SPC") {
        owner = msg.sender;
        icoAddress = _icoAddress;
        treasuryAddress = _treasuryAddress;

        _mint(_icoAddress, ICO_SUPPLY);
        _mint(_treasuryAddress, TREASURY_SUPPLY);
    }

    /// override transfer functions to charge the tax fee 
    /// send that fee to the treasury wallet
    function _transfer(address _from, address _to, uint256 _amount) internal virtual override {
        if(isTaxEnable) {
            uint256 taxAmount = (_amount * TAX_PERCENTAGE) / 100;
            _amount = _amount - taxAmount;
            super._transfer(_from, treasuryAddress, taxAmount);
        }

        super._transfer(_from, _to, _amount);
    }

    /// enable/disable the tax fee on transfers
    function enableDisableTax() external onlyOwner {
        isTaxEnable = !isTaxEnable;
    }
}