//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ItPubToken is ERC20 {
    address private owner;

    constructor() ERC20("ItPubToken", "ITP"){
        owner = msg.sender;
        _mint(msg.sender, 10 * 10 ** 18);
    }

    function changeOwner(address newOwner) public {
        require(msg.sender == owner, "Only owner can do that");
        owner = newOwner;
    }

    function burn(address from, uint256 amount) public {
        require(msg.sender == owner, "Only owner can do that");
        _burn(from, amount);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can do that");
        _mint(to, amount);
    }

}