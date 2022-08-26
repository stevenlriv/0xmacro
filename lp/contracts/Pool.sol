// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./SpaceCoin.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pool is ERC20 {
    uint112 public reserveETH;
    uint112 public reserveSPC;
    uint32 public blockTimestampLast;
    
    uint32 public constant feePerSwap = 1;

    SpaceCoin public immutable spaceCoin;

    uint private unlocked = 1;
    modifier reentrancy() {
        require(unlocked == 1, 'Pool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(SpaceCoin _spaceCoin) ERC20("SPC-ETH Pool", "SPC-ETH") {
        spaceCoin = _spaceCoin;
    }

    /// add liquidity
    /// pair token owner mint his lp tokens
    function mint(address _to) external payable {
        uint256 liquidity;
        uint256 LPtotalSupply = totalSupply();

        uint256 ethBalance = address(this).balance;
        uint256 spcBalance = spaceCoin.balanceOf(address(this));

        uint256 ethAmount = msg.value;
        uint256 spcAmount = spcBalance - reserveSPC;

        if (LPtotalSupply == 0) {
            liquidity = sqrt(ethAmount * spcAmount);
        } 
        else {
            liquidity = min(
                (ethAmount * LPtotalSupply) / reserveETH, 
                (spcAmount * LPtotalSupply) / reserveSPC
            );
        }

        require(liquidity > 0, "Pool: Add more liquidity to mint LP tokens");

        _mint(_to, liquidity);
        _update(ethBalance, spcBalance);

        emit Mint(_to, ethAmount, spcAmount);
    }

    /// remove liquidity
    /// the LP token holder redeems for underlying assets
    function burn(address _to) external reentrancy {
        uint256 liquidity = balanceOf(address(this));
        uint256 LPtotalSupply = totalSupply();

        uint256 ethBalance = address(this).balance;
        uint256 spcBalance = spaceCoin.balanceOf(address(this));

        uint256 ethAmount = (ethBalance * liquidity) / LPtotalSupply;
        uint256 spcAmount = (spcBalance * liquidity) / LPtotalSupply;

        require(ethAmount > 0 && spcAmount > 0, "Pool: No liquidity to be burned");

        _burn(address(this), liquidity);

        (bool ethSuccess, ) = _to.call{value: ethAmount}("");
        bool spcSuccess = spaceCoin.transfer(_to, spcAmount);

        require(ethSuccess && spcSuccess, "Pool: Failed to transfer tokens");

        ethBalance = ethBalance - ethAmount;
        spcBalance = spaceCoin.balanceOf(address(this));

        _update(ethBalance, spcBalance);

        emit Burn(_to, ethAmount, ethAmount);
    }

    /// here we charge 1% fee for swapping
    /// ethAmountIN = msg.value that comes from the router
    /// formula example: x * y = k
        /// xORG * yORG = k
        /// xORG = ETHreserve; yORG = SPCreserve; k = constant (ETHreserve*SPCreserve)
        /// yNEW = k/xORG
            /// userAmount = yORG - yNEW
        /// xNEW = k/yORG
            /// userAmount = xORG - xNEW
    function swap(address _to, uint256 ethAmountIN, uint256 spcAmountIN) external payable reentrancy {
        require(ethAmountIN > 0 && spcAmountIN == 0 || spcAmountIN > 0 && ethAmountIN == 0, "Pool: Set swaps amount");
        require(reserveETH > ethAmountIN && reserveSPC > spcAmountIN, "Pool: Not enough liquidity");

        uint256 ethAmountOUT;
        uint256 spcAmountOUT;

        uint256 ethBalance = reserveETH;
        uint256 spcBalance = reserveSPC;

        /// x * y = k
        uint256 xORG = ethBalance;
        uint256 yORG = spcBalance;
        uint256 k = xORG * yORG;

        /// we swap ETH for SPC example below
            /// 10 ETH * 50 SPC = 500
            /// the user adds 1 ETH to the swap
            /// 11 * yNEW = 500
            /// yNEW = 500/11
            /// yNEW = 45.45
            /// amountSPC = yORG - yNEW
            /// amountSPC = 50 - 45.45
            /// amountSPC = 4.55
            /// then take the fees ;-)
        if(ethAmountIN > 0) {
            require(ethAmountIN == msg.value, "Pool: Wrong eth amount");
            ethAmountOUT = 0;

            uint256 yNEW = k / (xORG + ethAmountIN);

            uint256 netSPC = yORG - yNEW;
            uint256 feeSPC = (feePerSwap * netSPC) / 100;

            spcAmountOUT = netSPC - feeSPC;

            bool spcSuccess = spaceCoin.transfer(_to, spcAmountOUT);
            require(spcSuccess, "Pool: Failed to transfer tokens");
        }

        /// we swap SPC for ETH
        else if(spcAmountIN > 0) {
            spcAmountOUT = 0;

            uint256 xNEW = k / (yORG + spcAmountIN);

            uint256 netETH = xORG - xNEW;
            uint256 feeETH = (feePerSwap * netETH) / 100;

            ethAmountOUT = netETH - feeETH;

            (bool ethSuccess, ) = _to.call{value: ethAmountOUT}("");
            require(ethSuccess, "Pool: Failed to transfer tokens");
        }

        ethBalance = address(this).balance;
        spcBalance = spaceCoin.balanceOf(address(this));

        /// lets verify that the user really deposited tokens to the pool
        uint256 verifyETHAmountIn;
        if(address(this).balance > reserveETH - ethAmountOUT) {
            verifyETHAmountIn = address(this).balance - (reserveETH - ethAmountOUT);
        }
        else {
            verifyETHAmountIn = 0;
        }

        uint256 verifySPCAmountIn;
        if(spcBalance > reserveSPC - spcAmountOUT) {
            verifySPCAmountIn = spcBalance - (reserveSPC - spcAmountOUT);
        }
        else {
            verifySPCAmountIn = 0;
        }

        require(verifyETHAmountIn > 0 || verifySPCAmountIn > 0, 'Pool: Deposit tokens to swap');

        /// lets verify k is still valid
        uint256 balanceETHAdjusted = (address(this).balance * 100) - (ethAmountIN * feePerSwap);
        uint256 balanceSPCAdjusted = (spcBalance * 100) - (spcAmountIN * feePerSwap);

        require(balanceETHAdjusted * balanceSPCAdjusted >= uint256(reserveETH) * uint256(reserveSPC) * (100**2), 'Pool: K is not valid');

        _update(ethBalance, spcBalance);

        emit TokenSwap(_to, ethAmountIN, spcAmountIN, ethAmountOUT, spcAmountOUT);
    }

    function _update(uint256 ethBalance, uint256 spcBalance) private {
        require(ethBalance <= type(uint112).max && spcBalance <= type(uint112).max, 'Pool: Overflow');

        reserveETH = uint112(ethBalance);
        reserveSPC = uint112(spcBalance);

        blockTimestampLast = uint32(block.timestamp % 2**32);

        emit Update(reserveETH, reserveSPC);
    }

    /// babylonian method
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    event Mint(address indexed addressMint, uint256 ethAmount, uint256 spcAmount);
    event Burn(address indexed addressBurn, uint256 ethAmount, uint256 spcAmount);
    event TokenSwap(address indexed addressTraded, uint256 ethAmountIN, uint256 spcAmountIN, uint256 ethAmountOUT, uint256 spcAmountOUT);
    event Update(uint112 reserveETH, uint112 reserveSPC);
}