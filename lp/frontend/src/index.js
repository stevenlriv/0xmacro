import { ethers } from "ethers"

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
let userAddress;

//Smart contracts ABI and connections
import IcoJSON from '../../artifacts/contracts/ICO.sol/ICO.json';
const icoAddr = '0x0AE8374b9fEe8FabF35a43cc23A31A9d2a2bC4F3';
const icoContract = new ethers.Contract(icoAddr, IcoJSON.abi, signer);

import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json';
const spaceCoinAddr = '0xec49Ea39f6B6A3dD9C606Ed33E590e8d9402Fb9d';
const spaceCoinContract = new ethers.Contract(spaceCoinAddr, SpaceCoinJSON.abi, signer);

import LPJSON from '../../artifacts/contracts/Pool.sol/Pool.json'
const LPAddr = '0xf72bC522601e439E7F979809d380A12E8149aca6';
const LPContract = new ethers.Contract(LPAddr, LPJSON.abi, signer);

import RouterJSON from '../../artifacts/contracts/Router.sol/Router.json'
const RouterAddr = '0xe0113FBe637116729e554CC76b95EB830DcE498b';
const RouterContract = new ethers.Contract(RouterAddr, RouterJSON.abi, signer);

async function connectToMetamask() {
  try {
    console.log("Signed in as", await signer.getAddress())
  }
  catch(err) {
    console.log("Not signed in")
    await provider.send("eth_requestAccounts", [])
  }
}

//
// ICO
//

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
  // TODO: Call ico contract contribute function
  try {
    await icoContract.contribute({value: eth});
  } catch (err) {
    document.getElementById("error").innerHTML = err.message;
    console.log(err);
  }
})

async function amountOfTokensLeftToBuy() {
  let amount;
  userAddress = await signer.getAddress();
  let currentPhase = await icoContract.currentPhase();
  let isSeedInvestor = await icoContract.seedInvestors(userAddress);
  let currentPurchasedTokens = await icoContract.contributionsByAddress(userAddress);
  let totalContributed = ethers.utils.formatEther(await icoContract.totalContributed());
  currentPurchasedTokens = ethers.utils.formatEther(currentPurchasedTokens);

  document.getElementById("ico_spc_phase").innerHTML = currentPhase;
  
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
    amount = 30000 - totalContributed;
  }

  // rate of 5 tokens per 1 ETH
  if(typeof amount == 'number') {
    amount = amount * 5;
  }

  document.getElementById("ico_spc_left").innerHTML = amount;
}

//
// LP
//
let reserveETH;
let reserveSPC;
let currentSpcToEthPrice = 5;

async function setReserveAndCurrentSPCETHPrice() {
  reserveETH = await LPContract.reserveETH();
  reserveSPC = await LPContract.reserveSPC();

  if(reserveETH > 0 && reserveSPC > 0) {
    currentSpcToEthPrice = await RouterContract._calculateExpectedAmount(ethers.utils.parseEther("1"), reserveETH, reserveSPC);
    currentSpcToEthPrice = ethers.utils.formatEther(currentSpcToEthPrice.toString());
  }
}

provider.on("block", n => {
  console.log("New block", n)
  // TODO: Update currentSpcToEthPrice
  setReserveAndCurrentSPCETHPrice();
  console.log('Current SpcToEthPrice: ' + currentSpcToEthPrice);
})

lp_deposit.eth.addEventListener('input', e => {
  lp_deposit.spc.value = +e.target.value * currentSpcToEthPrice
})

lp_deposit.spc.addEventListener('input', e => {
  lp_deposit.eth.value = +e.target.value / currentSpcToEthPrice
})

lp_deposit.addEventListener('submit', async e => {
  e.preventDefault()
  const form = e.target
  const eth = ethers.utils.parseEther(form.eth.value)
  const spc = ethers.utils.parseEther(form.spc.value)
  console.log("Depositing", eth, "eth and", spc, "spc")

  await connectToMetamask()
  // TODO: Call router contract deposit function
  try {

    // approve funds for pool
    await spaceCoinContract.approve(RouterAddr, spc);

    // add liquidity
    await RouterContract.addLiquidity(userAddress, eth, spc, eth, spc, {value: eth});

  } catch (err) {
    document.getElementById("error").innerHTML = err.message;
    console.log(err);
  }
})

lp_withdraw.addEventListener('submit', async e => {
  e.preventDefault()
  console.log("Withdrawing 100% of LP")

  await connectToMetamask()
  // TODO: Call router contract withdraw function
  try {

    let lpBalance = await LPContract.balanceOf(userAddress);

    // approve funds for pool
    await LPContract.approve(RouterAddr, lpBalance);

    // remove liquidity
    // we wait for transaction to ve approved in chain
    await RouterContract.removeLiquidity(userAddress);

  } catch (err) {
    document.getElementById("error").innerHTML = err.message;
    console.log(err);
  }
  
})

//
// Swap
//
let expectedAmount;
let actualAmount;
let slippage;
let slippageSelect = document.getElementById("slippageTolerance");
let swapIn = { type: 'eth', value: 0 }
let swapOut = { type: 'spc', value: 0 }
switcher.addEventListener('click', () => {
  [swapIn, swapOut] = [swapOut, swapIn]
  swap_in_label.innerText = swapIn.type.toUpperCase()
  swap.amount_in.value = swapIn.value

  updateSwapOutLabel();
  estimateTradeValueWithSlippage();
})

swap.amount_in.addEventListener('input', () => {
  updateSwapOutLabel();
  estimateTradeValueWithSlippage();
})

function updateSwapOutLabel() {
  swapOut.value = swapIn.type === 'eth'
    ? +swap.amount_in.value * currentSpcToEthPrice
    : +swap.amount_in.value / currentSpcToEthPrice

  swap_out_label.innerText = `${swapOut.value} ${swapOut.type.toUpperCase()}`
}

async function estimateTradeValueWithSlippage() {
 
  swapInType = swapIn.type;
  swapInValue = swap.amount_in.value;

  let reserve1;
  let reserve2;

  if(swapInType=='eth') {
    reserve1 = reserveETH;
    reserve2 = reserveSPC;
  }
  else {
    reserve1 = reserveSPC;
    reserve2 = reserveETH;
  }

  if(reserveETH > 0 && reserveSPC > 0) {
    if(swapInValue>0) {
      expectedAmount = await RouterContract._calculateExpectedAmount(ethers.utils.parseEther(swapInValue.toString()), reserve1, reserve2);
      actualAmount = await RouterContract._calculateActualAmount(ethers.utils.parseEther(swapInValue.toString()), reserve1, reserve2);
      slippage = ((actualAmount - expectedAmount)/expectedAmount) * 100;
      slippage = Math.abs(slippage);
    }
    else {
      expectedAmount = 0;
      actualAmount = 0;
      slippage = 0;
    }
  }
  else {
    expectedAmount = 'No liquidity available';
    actualAmount = 'No liquidity available';
    slippage = 0;
  }

  document.getElementById("expectedAmount").innerHTML = ethers.utils.formatEther(expectedAmount.toString());
  document.getElementById("actualAmount").innerHTML = ethers.utils.formatEther(actualAmount.toString());
  document.getElementById("slippagePercentage").innerHTML = slippage;

  if(slippage>slippageSelect.value) {
    document.getElementById("slippageMessage").innerHTML = 'Please increase your slippage tolerance to ' + slippage + ' % or more, because your trade will be rejected';
  }
}

swap.addEventListener('submit', async e => {
  e.preventDefault()
  const form = e.target
  const amountIn = ethers.utils.parseEther(form.amount_in.value)

  console.log("Swapping", amountIn, swapIn.type, "for", swapOut.type)

  await connectToMetamask()
  // TODO: Call router contract swap function
  try {
    let ethAmountIn;
    let spcAmountIn;
    let minimumAmountOut;

    // approve funds for pool
    if(swapIn.type=='eth') {
      ethAmountIn = amountIn;
      spcAmountIn = 0;
    }
    else {
      ethAmountIn = 0;
      spcAmountIn = amountIn;

      await spaceCoinContract.approve(RouterAddr, spcAmountIn);
    }

    if(slippage>slippageSelect.value) {
      document.getElementById("slippageMessage").innerHTML = 'Please increase your slippage tolerance to ' + slippage + ' % or more, because your trade will be rejected';
      minimumAmountOut = expectedAmount;
    }
    else {
      minimumAmountOut = actualAmount;
      await RouterContract.swapTokens(userAddress, ethAmountIn, spcAmountIn, minimumAmountOut,  {value: ethAmountIn})
    }

  } catch (err) {
    document.getElementById("error").innerHTML = err.message;
    console.log(err);
  }
})
