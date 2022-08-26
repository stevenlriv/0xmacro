import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Airdrop, ERC20, MacroToken } from "../typechain-types"

const provider = ethers.provider
let account1: SignerWithAddress
let account2: SignerWithAddress
let rest: SignerWithAddress[]

let macroToken: MacroToken
let airdrop: Airdrop
let merkleRoot: string

describe("Airdrop", function () {
  before(async () => {
    ;[account1, account2, ...rest] = await ethers.getSigners()

    macroToken = (await (await ethers.getContractFactory("MacroToken")).deploy("Macro Token", "MACRO")) as MacroToken
    await macroToken.deployed()

    //address that can claim
    //account1.address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    //account2.address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    //0xC627257eA77eD6B467D4376D237Bce8acB816C91

    /*
    root: 0x4d9c90bca55b28069f27b7e53c17102fcd1b9aafee66ee9372f04a6fdc96894d

    Leaves
    [
      "0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0",
      "0xdd9f0d40c1dca0cc4d24e34897012a332fc520f80a280436d64f4e3b81ea21c7",
      "0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9"
    ]

    Tree
    └─ 4d9c90bca55b28069f27b7e53c17102fcd1b9aafee66ee9372f04a6fdc96894d
      ├─ 8b6a34af39ad5a15c5be15567a231a69b220a387436a642b39b6c398db2b0659
      │  ├─ 00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0
      │  └─ dd9f0d40c1dca0cc4d24e34897012a332fc520f80a280436d64f4e3b81ea21c7
      └─ e9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9
        └─ e9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9
    */
    merkleRoot = "0x4d9c90bca55b28069f27b7e53c17102fcd1b9aafee66ee9372f04a6fdc96894d"
  })

  beforeEach(async () => {
    airdrop = await (await ethers.getContractFactory("Airdrop")).deploy(merkleRoot, account1.address, macroToken.address)
    await airdrop.deployed()
  })

  describe("setup and disabling ECDSA", () => {

    it("should deploy correctly", async () => {
      // if the beforeEach succeeded, then this succeeds
    })

    it("should disable ECDSA verification", async () => {
      // first try with non-owner user
      await expect(airdrop.connect(account2).disableECDSAVerification()).to.be.revertedWith("Ownable: caller is not the owner")

      // now try with owner
      await expect(airdrop.disableECDSAVerification())
        .to.emit(airdrop, "ECDSADisabled")
        .withArgs(account1.address)
    })
  })

  describe("Merkle claiming", () => {
    it ("TODO", async () => {
    })
  })

  describe("Signature claiming", () => {
    it ("TODO", async () => {
    })
  })

  describe("Full Coverage Testing Here", () => {
    it ("Owner mints MACRO Tokens", async () => {
      await macroToken.mint(airdrop.address, ethers.utils.parseEther("1000"))
    })

    it ("Non-owner tries to mint MACRO Tokens and fails", async () => {
      await expect(macroToken.connect(account2).mint(airdrop.address, ethers.utils.parseEther("1000"))).to.be.reverted
    })

    it ("User claims Airdrop with SignatureClaim", async () => {
      await macroToken.mint(airdrop.address, ethers.utils.parseEther("1000"))
    })

    it ("User tries to claim twice with SignatureClaim and fails", async () => {
    })

    it ("User not in list tries to claim Airdrop with SignatureClaim and fails", async () => {
    })

    it ("User tries to claim SignatureClaim then again with merkleClaim and fails", async () => {
    })

    it ("User tries to claim twice with merkleClaim and fails", async () => {
    })

    it ("User not in list tries to claim Airdrop with merkleClaim and fails", async () => {
    })

    it ("User tries to claim with merkleClaim then claims again with SignatureClaim and fails", async () => {
    })

    it ("Owner disableECDSAVerification Tokens", async () => {
      await airdrop.disableECDSAVerification()

      expect(await airdrop.isECDSADisabled()).to.equal(true)
    })

    it ("Non-owner tries to disableECDSAVerification and fails", async () => {
      await expect(airdrop.connect(account2).disableECDSAVerification()).to.be.reverted
    })

    it ("Owner disableECDSAVerification Tokens and User tries to call with SignatureClaim and fails", async () => {
      await airdrop.disableECDSAVerification()

      const messageHash = "0x0fcf0dff20e57b13aa9f6cb48c67a0af0b5ee9c1ada6b1c50f5b6328fcd49cc6"
      const messageHashBinary = ethers.utils.arrayify(messageHash)

      await expect(airdrop.connect(account2).signatureClaim(messageHashBinary, account1.address, 10)).to.be.reverted
    })

    it ("Owner disableECDSAVerification Tokens and User tries to call with merkleClaim and pass", async () => {
    })
  })
})