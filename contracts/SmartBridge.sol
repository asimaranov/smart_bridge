//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ItPubToken.sol";

contract SmartBridge {
    event SwapInitialized (
        address tokenToRedeem,
        address to,
        uint256 amount,
        uint256 nonce,
        uint256 targetChainId
    );

    event Redeem (
        address to,
        uint256 amount
    );

    uint256 private swapsNum;
    address private validator;
    uint256 private currentChainId;

    mapping(bytes32 => bool) private seenMessages;
    mapping(uint256 => bool) private allowedTargetChainIds;
    mapping(address => address) private allowedTokens;

    constructor(uint256 _currentChainId) {
        validator = msg.sender;
        currentChainId = _currentChainId; // Need for mocking in tests. Can be replaced with block.chainid comparison
    }

    modifier onlyValidator() {
        require(msg.sender == validator, "Only validator can do that");
        _;
    }

    function swap(address token, address to, uint256 amount, uint256 targetChainId) public returns (uint256 nonce) {
        require(allowedTokens[token] != address(0), "Token isn't allowed");
        require(allowedTargetChainIds[targetChainId], "Target chain id isn't allowed");

        ItPubToken(token).burn(msg.sender, amount);
        nonce = swapsNum;
        emit SwapInitialized(allowedTokens[token], to, amount, nonce, targetChainId);
        swapsNum++;
    }

    function redeem(address tokenToRedeem, address to, uint256 amount, uint256 nonce, uint256 targetChainId, uint8 v, bytes32 r, bytes32 s) public {
        require(targetChainId == currentChainId, "Message intended for other chain");

        bytes32 message = keccak256(abi.encodePacked(tokenToRedeem, to, amount, nonce, targetChainId));
        address realAddress = ecrecover(hashMessage(message), v, r, s);

        require(realAddress == validator, "Wrong signer");
        require(!seenMessages[message], "This request already processed");

        ItPubToken(tokenToRedeem).mint(to, amount);
        emit Redeem(to, amount);
        seenMessages[message] = true;
    }

    function updateChainById(uint256 targetChainId, bool isAllowed) public onlyValidator {
        allowedTargetChainIds[targetChainId] = isAllowed;
    }

    function includeToken(address tokenToBurn, address tokenToMint) public onlyValidator {
        allowedTokens[tokenToBurn] = tokenToMint;
    }

    function excludeToken(address token) public onlyValidator {
        allowedTokens[token] = address(0);
    }

    function hashMessage(bytes32 message) private pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, message));
    }
}