import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

enum ChainIds{
  ropstenChainId = 3,
  binanceChainId = 97
}

describe("Check bridge", function () {
  let bridge1: Contract;
  let bridge2: Contract;

  let token1: Contract;
  let token2: Contract;

  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
  const testAmount = ethers.utils.parseEther("0.01");
  const initialUser1Balance = ethers.utils.parseEther("1.0");

  const testNonce = 0;

  this.beforeEach(async () => {
    const ItPubToken = await ethers.getContractFactory("ItPubToken");
    token1 = await ItPubToken.deploy();
    await token1.deployed();

    token2 = await ItPubToken.deploy();
    await token2.deployed();

    
    const Bridge = await ethers.getContractFactory("SmartBridge");
    bridge1 = await Bridge.deploy(ChainIds.ropstenChainId);
    bridge2 = await Bridge.deploy(ChainIds.binanceChainId);

    await token1.changeOwner(bridge1.address);
    await token2.changeOwner(bridge2.address);

    [owner, user1, user2] = await ethers.getSigners();
    await token1.transfer(user1.address, initialUser1Balance);
  });

  it("Check that impossible to swap not allowed token", async function () {
    await expect(bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId)).to.be.revertedWith("Token isn't allowed");
  });

  it("Check that impossible to swap disallowed token", async function () {
    bridge1.includeToken(token1.address);
    bridge1.excludeToken(token1.address);
    await expect(bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId)).to.be.revertedWith("Token isn't allowed");
  });

  it("Check that impossible to send tokens to not allowed chain", async function () {
    bridge1.includeToken(token1.address, token2.address);
    await expect(bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId)).to.be.revertedWith("Target chain id isn't allowed");
  });

  it("Check that impossible to send tokens to disallowed chain", async function () {
    bridge1.includeToken(token1.address, token2.address);
    bridge1.updateChainById(ChainIds.binanceChainId, true);
    bridge1.updateChainById(ChainIds.binanceChainId, false);
    await expect(bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId)).to.be.revertedWith("Target chain id isn't allowed");
  });

  it("Check that ony owner can allow tokens", async function () {
    await expect(bridge1.connect(user1).includeToken(token1.address, token2.address)).to.be.revertedWith("Only validator can do that");
  });

  it("Check that ony owner can disallow tokens", async function () {
    await expect(bridge1.connect(user1).includeToken(token1.address, token2.address)).to.be.revertedWith("Only validator can do that");
  });

  it("Check that ony owner can manage target chainid", async function () {
    await expect(bridge1.connect(user1).updateChainById(ChainIds.binanceChainId, true)).to.be.revertedWith("Only validator can do that");
    await expect(bridge1.connect(user1).updateChainById(ChainIds.binanceChainId, false)).to.be.revertedWith("Only validator can do that");
  });

  it("Test swap behaviour", async function () {
    bridge1.includeToken(token1.address, token2.address);
    bridge1.updateChainById(ChainIds.binanceChainId, true);

    const initialSupply = await token1.totalSupply();
    const swapTransaction = await bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId);
    const rc = await swapTransaction.wait();
    const swapInitializedEvent = rc.events.find((e: {event: string}) => e.event == 'SwapInitialized');
    const [tokenToRedeem, to, amount, nonce, targetChainId] = swapInitializedEvent.args;

    expect(to).to.equal(user2.address);
    expect(amount).to.equal(testAmount);
    expect(await token1.balanceOf(user1.address)).to.equal(initialUser1Balance.sub(testAmount));
    expect(await token1.totalSupply()).to.equal(initialSupply.sub(testAmount));
    expect(nonce).to.equal(testNonce);
    expect(targetChainId).to.equal(ChainIds.binanceChainId);
    expect(tokenToRedeem).to.equal(token2.address);
  });

  it("Test nonce correctness", async function () {
    bridge1.includeToken(token1.address, token2.address);
    bridge1.updateChainById(ChainIds.binanceChainId, true);

    const swapTransaction1 = await bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId);
    const rc1 = await swapTransaction1.wait();
    const swapInitializedEvent1 = rc1.events.find((e: {event: string}) => e.event == 'SwapInitialized');
    const [tokenToRedeem1, to1, amount1, nonce1, targetChainId1] = swapInitializedEvent1.args;

    const swapTransaction2 = await bridge1.connect(user1).swap(token1.address, user2.address, testAmount, ChainIds.binanceChainId);
    const rc2 = await swapTransaction2.wait();
    const swapInitializedEvent2 = rc2.events.find((e: {event: string}) => e.event == 'SwapInitialized');
    const [tokenToRedeem2, to2, amount2, nonce2, targetChainId2] = swapInitializedEvent2.args;
    expect(nonce1).to.not.equal(nonce2);

  });

  it("Test redeem behaviour", async function () {
    const initialSupply = await token2.totalSupply();
    const messageToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"], 
      [token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId])
    );
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    const redeemTransaction = await bridge2.connect(user2).redeem(token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId, sig.v, sig.r, sig.s);
    const rc = await redeemTransaction.wait();
    const redeemEvent = rc.events.find((e: {event: string}) => e.event == 'Redeem');
    const [to, amount] = redeemEvent.args;

    expect(to).to.equal(user2.address);
    expect(amount).to.equal(testAmount);
    expect(await token2.balanceOf(user2.address)).to.equal(testAmount);
    expect(await token2.totalSupply()).to.equal(initialSupply.add(testAmount));
  });

  it("Check that it's impossible to redeem tokens on other blockchain", async function () {
    const messageToSign = ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"], [token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId]));
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await expect(bridge2.connect(user2).redeem(token2.address, user2.address, testAmount, testNonce, ChainIds.ropstenChainId, sig.v, sig.r, sig.s)).to.be.revertedWith("Message intended for other chain");
  });

  it("Check that only validator can sign a redeem request", async function () {
    const messageToSign = ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"], [token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId]));
    const signature = await user2.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await expect(bridge2.connect(user2).redeem(token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId, sig.v, sig.r, sig.s)).to.be.revertedWith("Wrong signer");
  });

  it("Check that user can get a reward only once", async function () {
    const messageToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"], 
      [token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId])
    );
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await bridge2.connect(user2).redeem(token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId, sig.v, sig.r, sig.s);
    await expect(bridge2.connect(user2).redeem(token2.address, user2.address, testAmount, testNonce, ChainIds.binanceChainId, sig.v, sig.r, sig.s)).to.be.revertedWith("This request already processed");
  });
});
