// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Pool.sol";
import "./SpaceCoin.sol";

contract Router {
    SpaceCoin public immutable spaceCoin;
    Pool public immutable pool;

    uint private unlocked = 1;
    modifier reentrancy() {
        require(unlocked == 1, 'Pool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(SpaceCoin _spaceCoin, Pool _pool) {
        spaceCoin = _spaceCoin;
        pool = _pool;
    }

    function addLiquidity(address _to, uint256 _ethAmount, uint256 _spcAmount, uint256 _ethAmountMin, uint256 _spcAmountMin) external payable reentrancy {
        require(msg.value > 0 && _ethAmount == msg.value, "Router: Send the right amount of ETH");
        require(spaceCoin.balanceOf(_to) >= _spcAmount, "Router: Send the right amount of SPC tokens");

        // this accounts for tax on transfer for spaceCoin tokens
        if(spaceCoin.isTaxEnable()) {
            uint256 taxAmount = (_spcAmount * spaceCoin.TAX_PERCENTAGE()) / 100;
            _spcAmount = _spcAmount - taxAmount;
        }

        /// lets calculate the amount of tokens required
        uint256 ethTransferAmount;
        uint256 spcTransferAmount;

        uint256 reserveETH = pool.reserveETH();
        uint256 reserveSPC = pool.reserveSPC();

        if (reserveETH == 0 && reserveSPC == 0) {
            ethTransferAmount = _ethAmount;
            spcTransferAmount = _spcAmount;
        } 
        else {
            uint256 amountSPCOptimal = _calculateExpectedAmount(_ethAmount, reserveETH, reserveSPC);

            if (amountSPCOptimal <= _spcAmount) {
                require(amountSPCOptimal >= _spcAmountMin, 'Router: Not enought SPC tokens to make LP');

                ethTransferAmount = _ethAmount;
                spcTransferAmount = amountSPCOptimal;
            } 
            else {
                uint256 amountETHOptimal = _calculateExpectedAmount(_spcAmount, reserveSPC, reserveETH);
                assert(amountETHOptimal <= _ethAmount);
                require(amountETHOptimal >= _ethAmountMin, 'Router: Not enought ETH to make LP');

                ethTransferAmount = amountETHOptimal;
                spcTransferAmount = _spcAmount;
            }
        }

        bool spcSuccess = spaceCoin.transferFrom(_to, address(pool), spcTransferAmount);
        require(spcSuccess, "Router: Failed to transfer tokens");

        /// lets mint the lp
        pool.mint{value: ethTransferAmount}(_to);

        // refund dust eth, if any
        if (msg.value > ethTransferAmount) {
            uint256 refundETH = msg.value - ethTransferAmount;
            (bool ethSuccess, ) = _to.call{value: refundETH}("");
            require(ethSuccess, "Router: Failed to return ETH dust");
        }
    }

    function removeLiquidity(address _to) external {
        /// check lp provider balance
        uint256 lpAmount = pool.balanceOf(_to);
        require(lpAmount > 0, "Router: No LP tokens available to burn");

        bool lpSuccess = pool.transferFrom(_to, address(pool), lpAmount);
        require(lpSuccess, "Router: Failed to transfer tokens");

        /// lets return their underlying tokens + any fees earned
        pool.burn(_to);
    }

    /// we swapt tokens according to a max slippage amount
    /// calculate slippage
    /// price impact = ((actual amount - expected amount)/expected amount) * 100
    function swapTokens(address _to, uint256 _ethAmountIN, uint256 _spcAmountIN, uint256 _amountOutMin) external payable {
        uint256 reserveETH = pool.reserveETH();
        uint256 reserveSPC = pool.reserveSPC();
        uint256 actualAmountOut;

        require(_ethAmountIN == msg.value, "Pool: Wrong eth amount");
        require(_ethAmountIN == 0 && _spcAmountIN > 0 || _ethAmountIN > 0 && _spcAmountIN == 0, "Router: You can only choose 1 token to swap");

        /// will receive ETH
        if(_spcAmountIN > 0) {
            require(spaceCoin.balanceOf(_to) >= _spcAmountIN, "Router: Don't have enough SPC tokens");

            uint256 balanceBefore = spaceCoin.balanceOf(address(pool));

            bool spcSuccess = spaceCoin.transferFrom(_to, address(pool), _spcAmountIN);
            require(spcSuccess, "Router: Failed to transfer tokens");

            // this accounts for tax on transfer for spaceCoin tokens
            if(spaceCoin.isTaxEnable()) {
                _spcAmountIN = spaceCoin.balanceOf(address(pool)) - balanceBefore;
            }

            /// check for min amounts
            actualAmountOut = _calculateActualAmount(_spcAmountIN, reserveSPC, reserveETH);
            require(actualAmountOut >= _amountOutMin, 'Router: Not enough ETH tokens to receive');

            pool.swap(_to, 0, _spcAmountIN);
        }

        /// will receive SPC
        else if(_ethAmountIN > 0) {
            /// check for min amounts
            actualAmountOut = _calculateActualAmount(_ethAmountIN, reserveETH, reserveSPC);
            require(actualAmountOut >= _amountOutMin, 'Router: Not enough SPC tokens to receive');
            
            pool.swap{value: msg.value}(_to, _ethAmountIN, 0);
        }
    }

    function _calculateActualAmount(uint256 _amountA, uint256 _reserveA, uint256 _reserveB) public view returns (uint amountB) {
        require(_amountA > 0, 'Router: Enter the right amountA');
        require(_reserveA > 0 && _reserveB > 0, 'Router: No liquidity available');

        uint256 feePerSwap = pool.feePerSwap();

        uint256 k = _reserveA * _reserveB;
        uint256 _reserveBNEW = k / (_reserveA + _amountA);

        uint256 netAmount = _reserveB - _reserveBNEW;
        uint256 feeAmount = (feePerSwap * netAmount) / 100;

        amountB = netAmount - feeAmount;
    }

    function _calculateExpectedAmount(uint256 _amountA, uint256 _reserveA, uint256 _reserveB) public pure returns (uint amountB) {
        require(_amountA > 0, 'Router: Enter the right amountA');
        require(_reserveA > 0 && _reserveB > 0, 'Router: No liquidity available');

        amountB = _amountA * _reserveB / _reserveA;
    }
}