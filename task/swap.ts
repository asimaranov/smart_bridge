import { task, types } from "hardhat/config";

task("swap", "Create swap request")

    .addParam("contractAddr", "Address of the deployed Bridge contract", "0x6701B8d99E7B13C592D6a04f7dD20f3cB45f1CC9")
    .addParam("tokenAddr", "Token address to swap", "0xCd87C27EC9F52A63225A52475617BBC08c528799")
    .addParam("to", "Address of user to send")
    .addParam("amount", "Amount of tokens to send", "0.01")
    .addParam("targetChainId", "Chain id to send tokens", 3, types.int)

    .setAction(async (taskArgs, hre) => {

        const bridgeContract = await hre.ethers.getContractAt("SmartBridge", taskArgs['contractAddr']);
        const swapTransaction = await bridgeContract.swap(taskArgs['tokenAddr'], taskArgs['to'], hre.ethers.utils.parseEther(taskArgs['amount']), taskArgs['targetChainId']);
        const rc = await swapTransaction.wait();
        const swapInitializedEvent = rc!.events!.find(e => e.event == 'SwapInitialized');
        const [to, amount, nonce] = swapInitializedEvent!.args!;
        console.log(`Successfully swaped to ${to} tokens: ${hre.ethers.utils.formatEther(amount)}. Transaction nonce: ${nonce}. Use the data to redeem on another network`)
    });
