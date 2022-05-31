import { isCommunityResourcable } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
const { parseEther } = ethers.utils;

const privateKey = process.env.PRIVATE_KEY as string;

describe("Bridge", function () {

  let acc1: any;

  let acc2: any;

  let acc3: any;

  let token: any;

  let bridge: any;

  beforeEach(async function() {
    [acc1, acc2, acc3] = await ethers.getSigners()

    // deploy ERC20 token
    const Erc20Token = await ethers.getContractFactory('Erc20Token', acc1)
    token = await Erc20Token.deploy("Pepelaz","PPLZ", ethers.utils.parseEther("10000"))
    await token.deployed()  

    const Bridge = await ethers.getContractFactory('Bridge', acc1)
    bridge = await Bridge.deploy(token.address)
    await bridge.deployed()  

    await token.setOwner(bridge.address)
  })


  it("should be deployed", async function(){
     expect(bridge.address).to.be.properAddress
  })

  it("can swap and redeem", async function(){
    const nonce = 1
    const amount = parseEther('500')

    let message = ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256"],
      [acc1.address, acc1.address, amount, nonce]
    )

    let signature = await acc1.signMessage(ethers.utils.arrayify(message))

    let tx = await bridge.swap(acc1.address, amount, nonce, signature)
    await tx.wait()

    expect(await token.balanceOf(acc1.address)).to.equal(parseEther("9500"))

    //---------

    let sig = await ethers.utils.splitSignature(signature)

    tx = await bridge.redeem(acc1.address, acc1.address, amount, nonce, sig.v, sig.r, sig.s)
    await tx.wait()

    expect(await token.balanceOf(acc1.address)).to.equal(parseEther("10000"))
 })
});