import { isCommunityResourcable } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
const { parseEther } = ethers.utils;


describe("Bridge", function () {

  let acc1: any;

  let acc2: any;

  let acc3: any;

  let token: any;

  let bridge1: any;

  let bridge2: any;

  beforeEach(async function() {
    [acc1, acc2, acc3] = await ethers.getSigners()

    // deploy ERC20 token
    const Erc20Token = await ethers.getContractFactory('Erc20Token', acc1)
    token = await Erc20Token.deploy("Pepelaz","PPLZ", ethers.utils.parseEther("10000"))
    await token.deployed()  
    
    // deploy 2 Bridge contracts
    const Bridge1 = await ethers.getContractFactory('Bridge', acc1)
    bridge1 = await Bridge1.deploy(token.address)
    await bridge1.deployed()  

    const Bridge2 = await ethers.getContractFactory('Bridge', acc1)
    bridge2 = await Bridge2.deploy(token.address)
    await bridge2.deployed() 

   
  })


  it("should be deployed", async function(){
     expect(bridge1.address).to.be.properAddress
  })

  it("can swap and redeem", async function(){
    const nonce = 1
    const amount = parseEther('500')
    const chainTo = 1337

    await token.setOwner(bridge1.address)

    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256","uint256"],
      [acc1.address, acc1.address, amount, nonce, chainTo]
    )

    let signature = await acc1.signMessage(ethers.utils.arrayify(hash))

    let tx = await bridge1.swap(acc1.address, amount, nonce, chainTo, hash, signature)
    await tx.wait()

    expect(await token.balanceOf(acc1.address)).to.equal(parseEther("9500"))

    //---------

    await bridge1.setTokenOwner(bridge2.address)

    let sig = await ethers.utils.splitSignature(signature)

    tx = await bridge2.redeem(acc1.address, acc1.address, amount, chainTo, hash, sig.v, sig.r, sig.s)
    await tx.wait()

     expect(await token.balanceOf(acc1.address)).to.equal(parseEther("10000"))
 })
});