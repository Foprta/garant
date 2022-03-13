// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken1 is ERC20, Ownable {
    constructor() ERC20("TestToken1", "TT1") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
