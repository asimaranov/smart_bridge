//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ItPubToken.sol";

contract SmartBridge {
    event SwapInitialized (
        address to,
        uint256 amount,
        uint256 nonce
    );

    event Redeem (
        address to,
        uint256 amount
    );

    ItPubToken private token;
    uint256 private swapsNum;
    address private validator;
    mapping(uint => bool) private seenNonces;

    constructor(address token_) {
        token = ItPubToken(token_);
        validator = msg.sender;
    }

    function swap(address to, uint256 amount) public returns (uint256 nonce) {
        token.burn(msg.sender, amount);
        nonce = swapsNum;
        emit SwapInitialized(to, amount, nonce);
        swapsNum++;
    }

    function redeem(address to, uint256 amount, uint256 nonce, uint8 v, bytes32 r, bytes32 s) public {
        require(checkSign(to, amount, nonce, v, r, s), "Wrong signer");
        require(!seenNonces[nonce], "Nonce already processed");
        token.mint(to, amount);
        emit Redeem(to, amount);
        seenNonces[nonce] = true;
    }

    function checkSign(address to, uint256 amount, uint256 nonce, uint8 v, bytes32 r, bytes32 s) private view returns (bool) {
        bytes32 message = keccak256(abi.encodePacked(to, amount, nonce));
        address realAddress = ecrecover(hashMessage(message), v, r, s);
        return realAddress == validator;
    }

    function hashMessage(bytes32 message) private pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, message));
    }
}