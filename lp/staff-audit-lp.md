https://github.com/0xMacro/student.stevenlriv/tree/02c7884cadb95fa986180a4544e9629928614382/lp

Audited By: Jamie

# General Comments

Hi Steven, good effort here in finishing such a complex project! You did have a few vulnerabilities in your contracts, but it still very much shows you've learned a lot in these past six weeks. I believe a lot of points here stem from the light testing coverage of the project. In the future, I really do recommend you adopt a TDD or even a test-while-coding workflow. The suggested approaches do have some upfront costs, but if done in a particular way, refactoring and making quick edits to contract code becomes a breeze, allowing you to proceed with confidence in your changes.


# Design Exercise

I agree with you intuition about this new token requiring some sort of utility. Otherwise, this new incentive token will be value-less.

> from there depending on the weight of the pool (you can create a function to calculate this user lp tokens/total lp tokens) and the amount of time you have been providing liquidity (using block.timestamp) the user will be rewarded; nothing that dificult

This is some good insight. It would definitely benefit the protocol to reward LPs proportionately depending on the amount of liquidity they provide. It would have been great to see a little bit more detail on how you would go about implementing this part.

It could also be important to ensure LPs don't add and remove liquidity to farm these new ERC20 tokens. How would you go about preventing this from happening?


# Issues

## **[H-1]** Reentrancy in `burn`
The contracts `burn()` function is vulnerable to reentrancy attack. It includes the low level `call()` function to transfer ETH. And in doing so, the contract passes control to an external account.
In line 66 of `Pool.sol`
```solidity
(bool ethSuccess, ) = _to.call{value: ethAmount}("");
```
Because the contract does not use a checks-effects-interaction pattern or a reentrancy guard, an attacker can exploit this to retrieve more funds from the pool than should be allowed. Consider this scenario where an LP chooses to split up the liquidity withdraw over two parts:
```
1. Attacker is an LP with 20 lpTokens (Supply = 100 lpTokens).

Initial State:
reserveETH = 100ETH, reserveSPC = 500SPC
address(this).balance = 100ETH

2. Attacker sends in 10 lpTokens to the pool and calls burn()
ethAmount = 100ETH * 10% = 10ETH
spcAmount = 500SPC * 10% = 50SPC
50% of attackers LP tokens burned
contract sends 10ETH -> Attacker reenters ->

Pool State:
reserveETH = 100ETH reserveSPC = 500SPC
address(this).balance = 90ETH
Supply = 90 lpTokens

3. -> Attacker sends in other 10 lpTokens and calls burn() again
ethAmount = (100ETH * 10) / 90 = 11.111 ETH
contract sends 11.11ETH 

4. No checks afterwards in function
```
Since `reserveETH` had not been updated in the reentry, the attacker was able to retrieve 21.11 ETH instead of 20 ETH.

Consider:
Using a the checks-effects-interaction pattern before these calls. Alternatively, a single `nonReentrant` modifier can be defined and applied to this function.

## **[M-1]** Router’s add liquidity function leaves excess ETH in the Router

When a user calls your add liquidity function, they have to send the desired amount of ETH `msg.value` in the transaction. When your router determines the right amounts of ETH/SPC to send into the pool, the amount sent to the pool may be less than `msg.value`. This occurs when the ratio of ETH:SPC has gone down in between when you broadcasted your transaction, and the transaction was mined in a block. Since you don’t refund the difference, the ETH will end up locked in your router.

See how Uniswap does the refund [here](https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router02.sol#L99).

Consider sending any excess ETH back to the caller.


## **[L-1]** ETH funds can be locked in contract if `msg.value > 0` and `_spcAmountIn > 0`
In line 72 of `Router.sol` your swap function looks like this:
```solidity
function swapTokens() {
  ...
  require(_ethAmountIN == 0 && _spcAmountIN > 0 || _ethAmountIN > 0 && _spcAmountIN == 0, "Router: You can only choose 1 token to swap");
  if (_spcAmountIN > 0) {
    ... // swap SPC -> ETH
  }
  else if (_ethAmountIN > 0) {
    require(_ethAmountIN == msg.value, "Pool: Wrong eth amount");
    ... // swap ETH -> SPC
  }
}
```
This function assumes that `msg.value` will equal `_ethAmountIn`, but is never enforced until the `else if` clause, which leaves the `SPC->ETH` swap unchecked. If a user includes a positive `msg.value` field, `_ethAmountIn` as zero, and a positive `_spcAmountIN`, the ETH sent into the router will be inaccessible.

Consider:
Moving the `ethAmountIn == msg.value` require check at the top of the function to enforce all paths.

## **[L-2]**  Incorrect calculation of `ethBalance` reserve
In line 26 of `Pool.sol` we have the following:
```solidity
uint256 ethBalance = reserveETH + msg.value;
```
This line assumes that the pool ETH reserve matches up exactly with `address(this).balance`. However, this may not be the case if `selfdestruct` is called, forcefully sending ETH to the pool. This line is problematic because `ethReserve` will eventually be updated with an incorrect value. Once this happens the contract's `reserveETH` constant value will be larger than it actually is. An LP can call `burn()` (since `address(this).balance` isn't being used here too) and receive more ETH in return than what that LP is owed.

Consider checking the actual amount the pool currently has:
```solidity
uint256 ethBalance = address(this).balance;
```

## **[Insufficient Tests]** Too few tests and untested code
While I do appreciate you annotating your tests cases with what is happening, your testing could be more comprehensive. Your contract has code that is untested, many of the test cases do not test precise values, and there are some important scenarios that should have been covered:
1. How does the contract handle adding liquidity, removing liquidity, and swaps if `SpaceCoin.isTaxEnable` is turned on?
1. How does `Router.sol` handle the different slippage values?

The following section of code is not tested (line 40 of `Router.sol`):
```solidity
else {
  uint256 amountETHOptimal = _calculateExpectedAmount(_spcAmount, reserveSPC, reserveETH);
  assert(amountETHOptimal <= _ethAmount);
  require(amountETHOptimal >= _ethAmountMin, 'Router: Not enought ETH to make LP');

  ethTransferAmount = amountETHOptimal;
  spcTransferAmount = _spcAmount;
}
```
You can always run `npx hardhat coverage` to see the testing report. I encourage you to test not only the happy paths but the sad paths as well.

## **[Technical Mistake-1]** `addLiquidity` does not take SPC's feeOnTransfer functionality into account

In `Router.addLiquidity` you use `_calculateExpectedAmount()` to calculate the amounts of ETH and SPC you should transfer into the pool, based on the reserve amounts and the SPC and ETH desired. However, this does not take into account the SPC tax. So, in `Pool.mint()` where the minimum of `ethAmount` and `spcAmount` determines the LP tokens to mint, it will use the reduced SPC amount to calculate the liquidity, effectively donating ETH to the pool, at the cost of the LP.

Consider checking if the 2% fee is toggled on, and subtracting that from the SPC amount to be received by the pool when calculating the optimal amount of ETH to send.

## **[Technical Mistake-2]** Unable to swap entire amount of SPC of an account
Your `swapTokens()` function does not allow an account to swap all the user's SPC for ETH. This is due to the following require statement in line 81 of `Router.sol`:
```solidity
require(spaceCoin.balanceOf(_to) > _spcAmountIN, "Router: Don't have enough SPC tokens");
```
Consider changing the `>` to a `>=` to allow users to swap the entirety of SPC for ETH.

## **[Technical Mistake-3]** Router’s `swapTokens` function does not account for feeOnTransfer tokens such as SPC

In your Router's `swapTokens` function you do not correctly handle the case where the 2% SPC transfer tax is turned on, and it will cause all calls to your Router's swap function to revert. Consider the following snippet of code in your Router:

```solidity
if(_spcAmountIN > 0) {
    require(spaceCoin.balanceOf(_to) > _spcAmountIN, "Router: Don't have enough SPC tokens");

    bool spcSuccess = spaceCoin.transferFrom(_to, address(pool), _spcAmountIN);
    require(spcSuccess, "Router: Failed to transfer tokens");

    /// check for min amounts
    actualAmountOut = _calculateActualAmount(_spcAmountIN, reserveSPC, reserveETH);
    require(actualAmountOut >= _amountOutMin, 'Router: Not enough ETH tokens to receive');

    pool.swap(_to, 0, _spcAmountIN);
}
```

When the 2% tax is turned on, the Router uses `transferFrom` to send `_spcAmountIN` to the Pool, but only `98 * _spcAmountIN / 100` is actually received by the pool. However, you call `pool.swap(_to, 0, _spcAmountIN)` **as if the full amount of `_spcAmountIN` had been received by the Pool**. Then the pool does the calculations for `ethAmountOUT` based on this incorrect value for `spcAmountIN`. The following check will then fail and the swap will revert.

```solidity
require(balanceETHAdjusted * balanceSPCAdjusted >= uint256(reserveETH) * uint256(reserveSPC) * (100**2), 'Pool: K is not valid');
```

Consider using the actual amount of SPC received by the Pool when calculating the amount of ETH the `to` address should receive.

One way to do this is to first read the Pool's SPC balance, then send the SPC to the pool, then measure the different between the previous balance and the new balance:

```solidity
uint256 balanceBefore = spaceCoin.balanceOf(address(pool));
(bool spcTransferSuccess) = spaceCoin.transferFrom(to, address(pool), amountSpcIn);
require(spcTransferSuccess, "Router: SPC_TRANSFER_FAILED");
uint256 actualSpcIn = spaceCoin.balanceOf(address(pool)) - balanceBefore;
// rest of Router swap code...
```

---

## **[Q-1]** Unnecessary private storage variables
In line 8-9 of `Router.sol` we have:
```solidity
SpaceCoin private spaceCoin;
Pool private pool;
```
These storage variables do not have any reason to be private. In fact, by having these important addresses `private`, it suggests the protocol has something to hide about the underlying liquidity pool and eth-token pair.

Consider:
Marking these as `public immutable` for full transparency and trust.

## **[Q-2]** Checks-effects-interaction pattern is not followed
In line 141 of `Pool.sol`, your contract uses a `call()` to send ETH in your `swap()` function:
```solidity
(bool ethSuccess, ) = _to.call{value: ethAmountOUT}("");
require(ethSuccess, "Pool: Failed to transfer tokens");
```
You should always be careful whenever external calls are involved. Passing control to an outside entity leaves your contract vulnerable to reentrancy attacks. There doesn't seem to be any possible attack vector in this swap function due to the `require()` statement in line 172, so I am marking this a code quality issue instead of a vulnerability, but make sure to keep an eye out for any external calls.

# Nitpicks

## **[N-1]** Constant could be used instead of magic number
In line 169 of `Pool.sol` we have: 
```solidity
 /// lets verify k is still valid
uint256 balanceETHAdjusted = (address(this).balance * 100) - (ethAmountIN * 1);
uint256 balanceSPCAdjusted = (spcBalance * 100) - (spcAmountIN * 1);
```
As it stands the `1` values at the end are [magic numbers](https://en.wikipedia.org/wiki/Magic_number_(programming)). Since the contract already has `feePerSwap` defined, the above should use it.


# Score

| Reason | Score |
|-|-|
| Late                       | - |
| Unfinished features        | - |
| Extra features             | - |
| Vulnerability              | 7 |
| Unanswered design exercise | - |
| Insufficient tests         | 2 |
| Technical mistake          | 4 |

Total: 13
