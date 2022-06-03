
import { HardhatUserConfig, task } from "hardhat/config";


// hardhat
// const tokenAddress = "0xF552938E5dbE33EF8eCE3c20547E96e9d469115F"
// const bridge1Address = "0x9830a0c11a9e973f8c9b6fC295654C95a5A2Cba7"
// const bridge2Address = "0x3c6DC850C2f3edc667476F939D659519A4EA5296"

const nonce = 1
const chainTo = 97


// rinkeby
//const tokenAddress = "0xFb45d87032Ddd2ffB1C09cC13BBf11C4E57ac43d"
const bridge1Address = "0xF0FB49d36ADC31fc67449bf5A9Ef42D401b84e71"

// bsctest
const tokenAddress = "0xe0Bf0cd10735935A7EF7d869Ca868Dd7930F1F59"
const bridge2Address = "0x4e76B2a6Ce7ab079A0581ef4a3f7486b392729A3"


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log(account.address);
    }
});
  

task("swap", "Swap task", async (taskArgs, hre) => {
   const amount = hre.ethers.utils.parseEther('100')
   const [signer]  = await hre.ethers.getSigners()

   const tokenArifact = await hre.artifacts.readArtifact("Erc20Token")
   const token = new hre.ethers.Contract(tokenAddress, tokenArifact.abi, signer)

   const bridgeArifact = await hre.artifacts.readArtifact("Bridge")
   const bridge = new hre.ethers.Contract(bridge1Address, bridgeArifact.abi, signer)




   let tx = await bridge.swap(signer.address, amount, nonce, chainTo, bridge2Address, { gasLimit: 2500000 })
   await tx.wait()

   console.log(await token.balanceOf(signer.address))

   const eventFilter = bridge.filters.BridgeOperation();
   const events = await bridge.queryFilter(eventFilter, "latest");
   console.log(events[0].args?.hash)

   let signature = await signer.signMessage(hre.ethers.utils.arrayify(events[0].args?.hash))

  console.log(signature)

});
  

task("redeem", "Redeem task")
.addParam("hash","Hash")
.setAction(async (taskArgs, hre) => {
  const { hash: hash} = taskArgs;
  const amount = hre.ethers.utils.parseEther('100')

  const [signer]  = await hre.ethers.getSigners()

  const tokenArifact = await hre.artifacts.readArtifact("Erc20Token")
  const token = new hre.ethers.Contract(tokenAddress, tokenArifact.abi, signer)

  const bridgeArifact = await hre.artifacts.readArtifact("Bridge")
  const bridge = new hre.ethers.Contract(bridge2Address, bridgeArifact.abi, signer)

  console.log(hash)

  let signature = await signer.signMessage(hre.ethers.utils.arrayify(hash))

  console.log(signature)

   

  let tx = await bridge.redeem(signer.address, signer.address, amount, chainTo, bridge2Address, nonce, signature, { gasLimit: 2500000 })
  await tx.wait()

  console.log(await token.balanceOf(signer.address))
});

task("getBalance", "Get balance", async (taskArgs, hre) => {
  const [signer] = await hre.ethers.getSigners();

  const tokenArifact = await hre.artifacts.readArtifact("Erc20Token")
  const token = new hre.ethers.Contract(tokenAddress, tokenArifact.abi, signer)

  console.log(await token.balanceOf(signer.address))
});
