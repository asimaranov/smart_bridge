import { task, types } from "hardhat/config";

task("redeem", "Redeem the tokens")
    .addParam("contractAddr", "Address of the deployed Bridge contract", "0x5F73792ee73D9f0C56E7A4236268D5af53851966")
    .addParam("tokenToRedeem", "Address of token to redeem")
    .addParam("to", "The user to whom the money was sent")
    .addParam("amount", "Amount of tokens to redeem", "0.01")
    .addParam("nonce", "Nonce of the request", 0, types.int)
    .addParam("targetChainId", "Target chain id", 3, types.int)

    .addParam("signature", "Signature to validate request", "0x8ee055bf08b73eb3c8c6f76b5d7c1494ec98854a691b42c442492cb7e4ffcf4c5cbf16a36291264234321d15f2532350088c16a2be000c353f7ef761a5163bec1b")

    .setAction(async (taskArgs, hre) => {
        const bridgeContract = await hre.ethers.getContractAt("SmartBridge", taskArgs['contractAddr']);
        const sig = hre.ethers.utils.splitSignature(taskArgs['signature']);
        const redeemTransaction = await bridgeContract.redeem(taskArgs['tokenToRedeem'], taskArgs['to'], hre.ethers.utils.parseEther(taskArgs['amount']), taskArgs['nonce'], taskArgs['targetChainId'], sig.v, sig.r, sig.s);
        const rc = await redeemTransaction.wait();
        const redeemEvent = rc!.events!.find(e => e.event == 'Redeem')!;
        const [to, amount] = redeemEvent!.args!;
        console.log(`Successfully redeemed to ${to} tokens: ${hre.ethers.utils.formatEther(amount)}`)

    });
