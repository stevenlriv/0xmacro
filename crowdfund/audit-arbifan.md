## **[H-1]** Goal will be reached falsely, opening up creator to withdraw money early 

On line 45, Project.sol has the following code:

    if(msg.value + address(this).balance >= fundingGoal)

This code assumes that the balance of the contract is updated after the fact, when it's actually updated immediately (and reverted if something fails). If the goal was 1 ETH, and a contributer sent .5 ETH then .3 ETH, on the second contribution the isClosed flag would incorrectly be flipped since address(this).balance would be .8 ETH and msg.value would be .3 ETH. This opens up the smart contract to the risk that a creator would withdraw the funds despite not actually reaching the goal.

Consider: Change the condition to be if(address(this).balance >= fundingGoal) OR use a variable to keep track of the balance of the contract (the first solution is probably cleaner)

## **[L-2]** Goal can be set to .005, which is below the minimum contribution

On line 31, Project.sol has the following code:
    constructor(string memory _name, string memory _tokenSymbol, string memory _description, uint256 _fundingGoal, address _creator) ERC721(_name, _tokenSymbol) {

This creation of the project does not check to make sure the goal is higher than the minimum contribution (0.01 ETH). This forces contributers to overshoot the goal to contribute to the project, enabling the creator to make additonal profit. 

Consider: adding a check in ProjectFactory.sol, or in the contructor of Project.sol, to see if the goal is less than .01 ETH

## **[Q-3]** Code reuses the same checks / require statements instead of using modfiers or enums

In lines 40 & 41, as well as 77 & 78, the same checks are reused:
        require(!isClosed, "Project: project has been closed");
        require(!isCancelled, "Project: project has been cancelled");

While these checks are fine, consider using modifiers or having a Status enum to make the code cleaner and more composable. 


## Nitpick 

- "30 days" can be a constant in the code, instead of a magic number
- consider creating a contribute function that receive calls, as opposed to having the logic all in receive
- Cancellation event is never emitted. Tests assume we do emit an event for this, so assuming this is something to include :) 



