import { task, types } from "hardhat/config";

task("updateChainById", "Manage allowed chain ids")

    .addParam("contractAddr", "Address of the deployed Bridge contract", "0x6701B8d99E7B13C592D6a04f7dD20f3cB45f1CC9")
    .addParam("targetChainId", "Chain id to send tokens", 3, types.int)
    .addParam("isAllowed", "Is allowed to send tokens to the chain", true, types.boolean)

    .setAction(async (taskArgs, hre) => {
        const bridgeContract = await hre.ethers.getContractAt("SmartBridge", taskArgs['contractAddr']);
        await bridgeContract.updateChainById(taskArgs['targetChainId'], taskArgs['isAllowed']);
    });
