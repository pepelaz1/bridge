import { ethers } from "hardhat";

async function main() {

  const Erc20Token = await ethers.getContractFactory('Erc20Token')
  const token = await Erc20Token.deploy("Pepelaz","PPLZ", ethers.utils.parseEther("10000"))
  await token.deployed()  
  console.log("Erc20Token deployed to:", token.address);

  const Bridge = await ethers.getContractFactory('Bridge')
  const bridge = await Bridge.deploy(token.address)
  await bridge.deployed()  
  console.log("Bridge deployed to:", bridge.address)

  await token.setMiner(bridge.address)
  await token.setBurner(bridge.address)

  // const Bridge2 = await ethers.getContractFactory('Bridge')
  // const bridge2 = await Bridge2.deploy(token.address)
  // await bridge2.deployed()  
  // console.log("Bridge2 deployed to:", bridge2.address)

  // await token.setMiner(bridge2.address)
  // await token.setBurner(bridge2.address)

  console.log("Deployment complete")
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
