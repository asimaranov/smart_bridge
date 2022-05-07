// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {

  const ItPubToken = await ethers.getContractFactory("ItPubToken");
  const itPubToken = await ItPubToken.deploy();

  await itPubToken.deployed();

  console.log("Token deployed to:", itPubToken.address);

  const Bridge = await ethers.getContractFactory("SmartBridge");
  const bridge = await Bridge.deploy(itPubToken.address);
  console.log("Bridge deployed to:", bridge.address);

  await itPubToken.changeOwner(bridge.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
