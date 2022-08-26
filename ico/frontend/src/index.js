import { ethers } from "ethers"
import IcoJSON from '../../artifacts/contracts/ICO.sol/ICO.json';
import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json';

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

const icoAddr = '0x3b43FC418f0CD06E647F565f58912e54A90E1107';
const icoContract = new ethers.Contract(icoAddr, IcoJSON.abi, signer);

const spaceCoinAddr = '0x6cfffa0db9f8a4157cf60a23bde2ee1b043733b3';
const spaceCoinContract = new ethers.Contract(spaceCoinAddr, SpaceCoinJSON.abi, signer);

async function connectToMetamask() {
  try {
    console.log("Signed in as", await signer.getAddress())
  }
  catch(err) {
    console.log("Not signed in")
    await provider.send("eth_requestAccounts", [])
  }
}

//lets set some values
amountOfTokensLeftToBuy();

ico_spc_buy.addEventListener('submit', async e => {
  e.preventDefault()
  const form = e.target
  const eth = ethers.utils.parseEther(form.eth.value)
  console.log("Buying", eth, "eth")

  // lets clean the stuff
  amountOfTokensLeftToBuy();
  document.getElementById("error").innerHTML = "";

  await connectToMetamask()

  // TODO: Call ico contract contribute function (very similar to your test code!)
  try {
    await icoContract.contribute({value: eth});
  } catch (err) {
    document.getElementById("error").innerHTML = err.message;
    console.log(err);
  }
})

async function amountOfTokensLeftToBuy() {
  let amount;
  let userAddress = await signer.getAddress();
  let currentPhase = await icoContract.currentPhase();
  let isSeedInvestor = await icoContract.seedInvestors(userAddress);
  let currentPurchasedTokens = await icoContract.contributionsByAddress(userAddress);
  currentPurchasedTokens = ethers.utils.formatEther(currentPurchasedTokens);

  if(currentPhase == 0) {
    if(isSeedInvestor) {
      amount = 1500 - currentPurchasedTokens;
    }
    else {
      amount = 'only seed investors can purchase at this stage';
    }
  }
  else if(currentPhase == 1 && currentPurchasedTokens<1000) {
    amount = 1000 - currentPurchasedTokens;
  }
  else if(currentPhase == 2) {
    amount = 'no limit until hardcap is reached';
  }

  // rate of 5 tokens per 1 ETH
  if(typeof amount == 'number') {
    amount = amount * 5;
  }

  document.getElementById("ico_spc_left").innerHTML = amount;
}

/**
 
async function amountOfTokensLeftToBuy() {
  let amount;
  let userAddress = await signer.getAddress();
  let currentPhase = await icoContract.currentPhase();
  let isSeedInvestor = await icoContract.seedInvestors(userAddress);
  let currentPurchasedTokens = await icoContract.contributionsByAddress(userAddress);

  if(currentPhase == 0) {
    if(isSeedInvestor) {
      amount = ethers.utils.parseEther('1500') - currentPurchasedTokens;
    }
    else {
      amount = 'only seed investors can purchase at this stage';
    }
  }
  else if(currentPhase == 1 && currentPurchasedTokens<ethers.utils.parseEther('1000')) {
    amount = ethers.utils.parseEther('1000') - currentPurchasedTokens;
  }
  else if(currentPhase == 2) {
    amount = 'no limit until hardcap is reached';
  }

  // rate of 5 tokens per 1 ETH
  if(typeof amount == 'number') {
    amount = ethers.utils.formatEther(amount)
    ///amount = amount * 5;

  }

  document.getElementById("ico_spc_left").innerHTML = amount;
}

 */