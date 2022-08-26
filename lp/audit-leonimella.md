# Contract Peer Micro Audit

You did a really awesome job in the coding organization!

## Classification Legend

| Severity           | Code | Description                                                                                                                                             |
| ------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High               | H-n  | This issue can take the entire project down. Ownership can get hacked, funds can get stolen, bad actors can grief everyone else, these sorts of things. |
| Medium             | M-n  | There's some large potential risk, but it's not obvious whether the issue will actually happen in practice.                                             |
| Low                | L-n  | A small amount of risk, perhaps unlikely, perhaps not relevant, but notable nonetheless.                                                                |
| Unfinished Feature | UF-n | Unfinished Features described in the specification                                                                                                      |
| Extra Feature      | EF-n | Extra features added to the project                                                                                                                     |
| Technical Mistake  | TM-n | No security threats, but not working as intended in the specification                                                                                   |
| Code Quality       | Q-n  | No obvious risk, but fixing it improves code quality, better conforms to standards, and ultimately may reduce unperceived risk in the future.           |

## **[M-1]** Router `addLiquidity` doesn't send back unused eth.

In the Router contract, the `addLiquidity` function calculates the correct amount of eth to be added to the pool:

```solidity
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
```

Notice that in the `else` portion of the logic, the `_ethAmount` variable doesn't correspond to the amount of eth that must be sent to the Pool. In fact you are checking precisely that on line 42:

```solidity
assert(amountETHOptimal <= _ethAmount);
```

So if this condition passes, there will be left overs from the original amount in the `msg.value` that have not been used to gain more LP tokens neither getting back to the original user being trapped in the Router contract.

Consider adding a last step in this function where you can check if there is some left over and send it back to the original owner:

```solidity
uint256 reminderEth = _ethAmount - amountETHOptimal;

if (reminderEth > 0) {
    (bool success,) = msg.sender.call{value: reminderEth}("");
    if (!success) revert("Failed Transaction");
}
```

## **[L-1]** The functions in the `Pool` contract don't have any sort of re-entrancy protection.

Both functions: `swap` and `burn` make eth transactions to arbitrary addresses in them. They also have state variables changes after those calls introducing the possibility for flashloans/flashswaps.

The problem is that none of the public functions have any lock on them to avoid a re-entrancy attack. So one could manipulate states/balances calling a function after a flashloan/flashswap and this could be very bad.

I couldn't find a scenario where the funds got stolen, but I'm classifing this as a Low Vunlnerability because I think it's dangerous to be exposed to these kinds of scenarios.

## **[Q-1]** Function `swap` in the Pool contract has unnecessary multiplication by `1`.

In line 169 and 170, Pool.sol has:

```solidity
/// lets verify k is still valid
uint256 balanceETHAdjusted = (address(this).balance * 100) - (ethAmountIN * 1);
uint256 balanceSPCAdjusted = (spcBalance * 100) - (spcAmountIN * 1);

require(balanceETHAdjusted * balanceSPCAdjusted >= uint256(reserveETH) * uint256(reserveSPC) * (100**2), 'Pool: K is not valid');
```

Maybe the idea was to use the variable `feePerSwap` instead of the `1` value, but still, you could save a little gas by avoiding this operation.

And another operation that can be removed is the multiplication by `100` that you do on both sides of the `require` statement. I believe it's unnecessary since you are doing this for both values.

Consider removing this multiplications:

```solidity
/// lets verify k is still valid
uint256 balanceETHAdjusted = address(this).balance - ethAmountIN;
uint256 balanceSPCAdjusted = spcBalance - spcAmountIN;

require(balanceETHAdjusted * balanceSPCAdjusted >= uint256(reserveETH) * uint256(reserveSPC), 'Pool: K is not valid');
```

## **[Q-2]** Function `_update` in the Pool contract has unnecessary checks

In line 180, Pool.sol has the following code:

```solidity
function _update(uint256 ethBalance, uint256 spcBalance) private {
    require(ethBalance <= type(uint112).max && spcBalance <= type(uint112).max, 'Pool: Overflow');

    reserveETH = uint112(ethBalance);
    reserveSPC = uint112(spcBalance);

    blockTimestampLast = uint32(block.timestamp % 2**32);

    emit Update(reserveETH, reserveSPC);
}
```

Since this is a private function, in every use case of this function you are defining both `ethBalance` and `spcBalance` you could just set these variables to `uint112` instead of `uint256` eliminating the need for the `require statement`.

Another thing is that Solidity would automatically revert if an overflow would happen.

Consider remove this check and change the variables declaration to `uin112`

## **Nitpicking**

- On Router, `addLiquidity` function doesn't need the parameter `_ethAmount`, could just be a variable inside the function;
- On Router, fee deduction could be slightly simpler:
  - Insted of: `uint256 feeAmount = (feePerSwap * netAmount) / 100` one could: `uint256 amountWithoutFee = (99 * netAmount) / 100` this give us the amount without fee in one operation instead of find 1% of the value and then subtracting it from the netValue
- On Pool, `swap` function doesn't need the parameter `ethAmountIN`, could just be a variable inside the function;
