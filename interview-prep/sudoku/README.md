# Sudoku

## Vulnerabilities

SudokuExchange.sol

    [H-1] function claimReward
        - Does not verifies if the reward was already claimed. An easy way to do this is:
            require(!rewardChallenges[address(challenge)].solved, "The reward was already claimed");

    [H-2] function claimReward line 57:
        - ERC20 standard transfer functions is defined as transfer(address to, uint256 amount)
        - In this implementation the to adress has to be msg.sender and you are using address(this).
        - A fix for this would be
            challengeReward.token.transfer(msg.sender, challengeReward.reward);

    [H-3] there is now way to start a new Sudoku challenge for users in the SudokuExchange smart contract, they will have to first deploy a SudokuChallenge contract, but you could easily add a function in SudokuExchange to deploy/and or add multiple challenges if you modify the SudokuChallenge contract.

    [M-1] function createReward
        - Make sure that you are veryfing that tokens are being transfered, you can solve this checking for boolean status. Example:
            bool success = challengeReward.token.transferFrom(msg.sender, address(this), challengeReward.reward);
            require(success, "Failed to transfer tokens");

    [M-2] function createReward
        - Make a require function where you verify that the reward is >0
            require(challengeReward.reward>0, "Enter a reward thats more than 0");
        - Also make sure the verify that its a valid ERC-20 address


## Code Quality Issues

SudokuExchange.sol

    [QA-1] Remove visibility public for empty constructor. Its not needed.

SudokuChallenge.sol

    [QA-1] Remove visibility public for constructor. Its not needed.

## Gas Optimizations

SudokuExchange.sol

    [1] function claimReward could be changed from public to external to save on gas

    [2] function createReward could be changed from public to external to save on gas

    [3] Line 47: change uint8 to uint256 
        Cheaper to use uint256. 
        
        The reason for this is that the EVM reads 32 bytes at a time and will have to do some operations to make the data it is reading go down to 8 bits 

        Read more here: https://ethereum.stackexchange.com/questions/3067/why-does-uint8-cost-more-gas-than-uint256/3071#3071

        On another note uint8 is good on multiple variables when packing data to the same memory slot.

SudokuChallenge.sol

    [1] Line 54: function validate could be changed from public to external to save on gas

    [2] Line 7, 46 and 54: change uint8 to uint256 (read explanation above)

## Grading

You must find all but 1 of the High and Medium severity vulnerabilities in order to pass this interview.

Be aware, one of the vulnerabilities is related to the design itself.

You must have at least 3 of the Gas Optimizations to pass this interview.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
