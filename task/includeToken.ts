import { task, types } from "hardhat/config";

task("includeToken", "Allow token to send")

    .addParam("contractAddr", "Address of the deployed Bridge contract", "0x6701B8d99E7B13C592D6a04f7dD20f3cB45f1CC9")
    .addParam("tokenToBurn", "Address of token on 1 blockchain")
    .addParam("tokenToMint", "Address of token on 2 blockchain")

    .setAction(async (taskArgs, hre) => {
        const bridgeContract = await hre.ethers.getContractAt("SmartBridge", taskArgs['contractAddr']);
        await bridgeContract.includeToken(taskArgs['tokenToBurn'], taskArgs['tokenToMint']);
    });
