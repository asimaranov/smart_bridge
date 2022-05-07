import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Check bridge", function () {
  let bridge: Contract;
  let token: Contract;
  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
  const testAmount = ethers.utils.parseEther("0.01");
  const initialUser1Balance = ethers.utils.parseEther("1.0");

  const testNonce = 0;

  this.beforeEach(async () => {
    const ItPubToken = await ethers.getContractFactory("ItPubToken");
    token = await ItPubToken.deploy();
    await token.deployed();
    
    const Bridge = await ethers.getContractFactory("SmartBridge");
    bridge = await Bridge.deploy(token.address);
  
    await token.changeOwner(bridge.address);

    [owner, user1, user2] = await ethers.getSigners();
    await token.transfer(user1.address, initialUser1Balance);
  });

  it("Test swap behaviour", async function () {
    const initialSupply = await token.totalSupply();
    const swapTransaction = await bridge.connect(user1).swap(user2.address, testAmount);
    const rc = await swapTransaction.wait();
    const swapInitializedEvent = rc.events.find((e: {event: string}) => e.event == 'SwapInitialized');
    const [to, amount, nonce] = swapInitializedEvent.args;

    expect(to).to.equal(user2.address);
    expect(amount).to.equal(testAmount);
    expect(await token.balanceOf(user1.address)).to.equal(initialUser1Balance.sub(testAmount));
    expect(await token.totalSupply()).to.equal(initialSupply.sub(testAmount));
    expect(nonce).to.equal(testNonce);
  });

  it("Test redeem behaviour", async function () {
    const initialSupply = await token.totalSupply();
    const messageToSign = ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [user2.address, testAmount, testNonce]));
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    const redeemTransaction = await bridge.connect(user2).redeem(user2.address, testAmount, testNonce, sig.v, sig.r, sig.s);
    const rc = await redeemTransaction.wait();
    const redeemEvent = rc.events.find((e: {event: string}) => e.event == 'Redeem');
    const [to, amount] = redeemEvent.args;

    expect(to).to.equal(user2.address);
    expect(amount).to.equal(testAmount);
    expect(await token.balanceOf(user2.address)).to.equal(testAmount);
    expect(await token.totalSupply()).to.equal(initialSupply.add(testAmount));

  });

  it("Check that only validator can sign a redeem request", async function () {
    const messageToSign = ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [user2.address, testAmount, testNonce]));
    const signature = await user2.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await expect(bridge.connect(user2).redeem(user2.address, testAmount, testNonce, sig.v, sig.r, sig.s)).to.be.revertedWith("Wrong signer");
  });

  it("Check that user can get a reward only once", async function () {
    const messageToSign = ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [user2.address, testAmount, testNonce]));
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await bridge.connect(user2).redeem(user2.address, testAmount, testNonce, sig.v, sig.r, sig.s);
    await expect(bridge.connect(user2).redeem(user2.address, testAmount, testNonce, sig.v, sig.r, sig.s)).to.be.revertedWith("Nonce already processed");
  });
  
});
