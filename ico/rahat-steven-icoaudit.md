
# General Comments

Awesome work! I like the way you went about the ICO - some small comments below. 




# Issues

Transfer function sending funds twice when taxable

Transfer function as written - when the taxable amount is ready it will send however there doesn't seem to be anything stopping it from executing the second transfer outside of the if statement. Consider updating to an if-else statement for function _transfer on line 38. 


Unnecessary use of storage for variable

Unnecessary storage variable for max supply in ICO - doesn't seem to be used anywhere and the other two constant variables handle anything you need. Consider removing MAX_SUPPLY constant variable in spacecoin.sol line 7. 

