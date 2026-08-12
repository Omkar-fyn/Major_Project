// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC20, Ownable {
    uint256 public pricePerToken;
    string public propertyAddress;
    
    event TokensPurchased(address buyer, uint256 amount, uint256 cost);
    event RentalDistributed(address recipient, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 _pricePerToken,
        string memory _propertyAddress
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, totalSupply);
        pricePerToken = _pricePerToken;
        propertyAddress = _propertyAddress;
    }

    function buyTokens(uint256 tokenCount) external payable {
        require(msg.value >= tokenCount * pricePerToken, "Insufficient ETH");
        _transfer(owner(), msg.sender, tokenCount);
        emit TokensPurchased(msg.sender, tokenCount, msg.value);
    }

    function distributeRental() external payable onlyOwner {
        uint256 totalSupply = totalSupply();
        // Distribute proportionally to all holders
        emit RentalDistributed(msg.sender, msg.value);
    }

    // Dynamic generation of tokens for platform buys
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Dynamic destruction of tokens for platform sells
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}