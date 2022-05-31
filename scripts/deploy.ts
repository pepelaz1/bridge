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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
