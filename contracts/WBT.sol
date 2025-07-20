// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WBT is ERC20 {
    constructor() ERC20("WalletBank Token", "WBT") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 8; // Bitcoin has 8 decimal places
    }
}