Audited By: Lily Johnson

# General Comments

Great job! Your code is clean and easy to read. Most of the audit focuses on code quality improvements. Overall good execution!


# Design Exercise

Good answer! As an expansion of your design, consider the complication of repeat contributors. What would you do for the calculations if a user contributes multiple times? Would their vesting reset for all of their contributions? Would you keep track of vesting per contribution?

# Issues

**[L-0]** Don't use `address(this).balance` as an accounting variable 

Contracts in ethereum can be force fed ETH by using `selfdestruct` or by pre-calculating the contract's address and sending it ETH before deployment (see: https://consensys.github.io/smart-contract-best-practices/attacks/force-feeding/). 

Use of `address(this).balance` in `ICO` as an accounting variable can enable malicious users to send ETH to the contract and trigger the contribution tier limits. For example, a malicious person could send the contract 30_000 ETH and prevent people from contributing to the ICO.

Your use of `address(this).balance` in `ICO`'s `contribute()` starting on line 44 exposes your contract to this risk.

Consider: using an accounting variable to track the amount of ETH contributed instead of the ETH in the contract.

## **[L-1]** Dangerous Phase Transitions

If the `progressPhases` function is called twice, a phase can accidentally be skipped. There are a few situations where this might occur:

1. Front-end client code malfunction calling the function twice.
2. Human error double-clicking a button on the interface on accident.
3. Repeat invocations with intent - Uncertainty around whether or not a 
transaction went through, or having a delay before a transaction processes, are common occurrences on Ethereum today.

Phase transitions are especially problematic, because once the ICO has advanced to the next phase there is no going back. Compare this to the toggle tax functionality, where it is easy for the owner to fix.

Consider refactoring this function by adding an input parameter that specifies either the expected current phase, or the expected phase to transition to.

**[Extra Feature]** Removing allowlisted addresses is not part of the spec 

This feature increases the attack surface of the contract and deviates from the spec. Being able to remove addresses means even after an address has been added, they are at the mercy of the owner of the ICO, who can remove them at any time.

Consider: changing `ICO`'s `addRemoveSeedInvestors()` function on line 96 to only add and not remove.


**[Technical Mistake]** Pause applied to other functionality

The spec says "The owner of the contract should have the ability to pause and resume fundraising at any time,". When the pause is on, it should only prevent contributions. It should not prevent other actions such as redeeming of previously earned tokens or progressing the phase forward.

Consider: only having the `ICO`'s `contribute()` function pausable and not the `progressPhases()` or `claimTokens()` function.


**[Q-0]** Adding allow-listed addresses 1 by 1 is very gas inefficient 

Each Ethereum transaction has an initial fixed cost of 21_000 gas, which is in addition to the cost of executing computation and storing variables in the contract. By only allowing a single allowed address to be added per function call, this is going to waste a lot of gas compared to a function which takes in an array of allowlisted addresses and adds them in a single transaction. 

Consider changing the `addRemoveSeedInvestors()` of on line 96 of  `ICO` to accept an `address[]` as an argument, where the function loops through these addresses adding them all in a single function call.


**[Q-1]** Use NatSpec format for comments 

Solidity contracts can use a special form of comments to provide rich documentation for functions, return variables and more. This special form is named the Ethereum Natural Language Specification Format (NatSpec). 

It is recommended that Solidity contracts are fully annotated using NatSpec for all public interfaces (everything in the ABI). Using NatSpec will make your contracts more familiar for others to audit, as well as making your contracts look more standard. 

For more info on NatSpec, check out [this guide](https://docs.soliditylang.org/en/develop/natspec-format.html). 

Consider: annotating your contract code via the NatSpec comment standard.


**[Q-2]** Immutable values are using contract storage

If you have values which are set in your contract constructor and then never changed, as `owner`, `icoAddress`, and `treasuryAddress`  in  `SpaceCoin` and `owner` in `ICO`, then you can declare them with the `immutable` keyword. This will save gas as the compiler will not reserve storage for them and instead inline the values where they are used.


**[Q-3]** Long Error Messages

Long error messages cost you. Generally, try to keep error messages 
[below 32 ASCII characters](https://medium.com/@chebyk.in/how-big-is-solidity-custom-error-messages-overhead-1e915724b450).

If you feel you need longer error messages, it's best practice to store them
within your client/front end.

Instead of:
```
require( _state == ProjectStates.SUCCESS,
            "Project cannot be withdrawn from at this time."
        );
```

Consider:

```
require( _state == ProjectStates.SUCCESS,
            "WITHDRAW_FORBIDDEN")
        );
```

**[Q-4]** Missing Events for several functions.

Events are useful for keeping your frontend and other interested parties up to date on what state your contract is currently in. 

Consider adding events to the `ICO`'s  functions `addRemoveSeedInvestors()` and `enableDisableICO()` and to `SpaceCoin`'s `enableDisableTax()`.

# Nitpicks

**[NIT-0]** Testing coverage for tax-enabled SPC transfers in `SpaceCoin` missing

If you run `npx hardhat coverage` and open the generated `coverage/index.html` file, you'll be able to see what lines of code are missing coverage in your test suites.

Consider: adding a test case with a transfer enabled to make `SpaceCoin`'s coverage complete.

**[NIT-1]** Optimize your code to reduce bytecode and deployment cost by setting optimizer in the hardhat config file

Melville stressed this in class, refer to: https://hardhat.org/config. Example:
  ```
   solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  }
  ```

**[NIT-3]** Consider using Enums for the state to improve readability

Solidity has enums which can be used to improve readability in code. Consider using enums for the `ICO`'s phases.

```
    enum States {
        SEED,
        GENERAL,
        OPEN
    }
```


# Score

| Reason | Score |
|-|-|
| Late                       | - |
| Unfinished features        | - |
| Extra features             | 1 |
| Vulnerability              | 2 |
| Unanswered design exercise | - |
| Insufficient tests         | - |
| Technical mistake          | 1 |

Total: 4
