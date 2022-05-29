import { expect } from "chai";
import { ethers } from "hardhat";

describe("Bridge", function () {

  let acc1: any;

  let acc2: any;

  let acc3: any;

  let bridge: any;

  beforeEach(async function() {
    [acc1, acc2, acc3] = await ethers.getSigners()
    const Bridge = await ethers.getContractFactory('Bridge', acc1)
    bridge = await Bridge.deploy()
    await bridge.deployed()  
  })


  it("should be deployed", async function(){
     expect(bridge.address).to.be.properAddress
  })
});