import { task, types } from "hardhat/config";

task("excludeToken", "Allow token to send")
    .addParam("contractAddr", "Address of the deployed Bridge contract", "0x6701B8d99E7B13C592D6a04f7dD20f3cB45f1CC9")
    .addParam("tokenToExclude", "Address of token on 1 blockchain to exclude")

    .setAction(async (taskArgs, hre) => {
        const bridgeContract = await hre.ethers.getContractAt("SmartBridge", taskArgs['contractAddr']);
        await bridgeContract.excludeToken(taskArgs['tokenToBurn']);
    });
