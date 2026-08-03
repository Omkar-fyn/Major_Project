// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BondingCurveAMM is ReentrancyGuard, Ownable {
    IERC20 public propertyToken;

    uint256 public reserveETH;
    uint256 public reserveToken;

    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokenAmount);
    event TokensSwapped(address indexed user, uint256 ethIn, uint256 tokenIn, uint256 ethOut, uint256 tokenOut);

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = IERC20(_propertyToken);
    }

    // Add initial liquidity to establish the curve (Constant Product x * y = k)
    function addLiquidity(uint256 tokenAmount) external payable onlyOwner nonReentrant {
        require(msg.value > 0 && tokenAmount > 0, "Amounts must be > 0");
        
        require(propertyToken.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        reserveETH += msg.value;
        reserveToken += tokenAmount;

        emit LiquidityAdded(msg.sender, msg.value, tokenAmount);
    }

    // Get the price based on x * y = k formula
    // outputAmount = (outputReserve * inputAmount) / (inputReserve + inputAmount)
    function getAmountOut(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 997; // 0.3% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }

    // Buy tokens with ETH
    function buyTokens() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        
        uint256 tokensToReceive = getAmountOut(msg.value, reserveETH, reserveToken);
        require(tokensToReceive > 0, "Insufficient output amount");
        require(reserveToken >= tokensToReceive, "Insufficient liquidity");

        reserveETH += msg.value;
        reserveToken -= tokensToReceive;

        require(propertyToken.transfer(msg.sender, tokensToReceive), "Token transfer failed");

        emit TokensSwapped(msg.sender, msg.value, 0, 0, tokensToReceive);
    }

    // Sell tokens for ETH
    function sellTokens(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Must send tokens");

        uint256 ethToReceive = getAmountOut(tokenAmount, reserveToken, reserveETH);
        require(ethToReceive > 0, "Insufficient output amount");
        require(reserveETH >= ethToReceive, "Insufficient liquidity");

        require(propertyToken.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        reserveToken += tokenAmount;
        reserveETH -= ethToReceive;

        (bool success, ) = payable(msg.sender).call{value: ethToReceive}("");
        require(success, "ETH transfer failed");

        emit TokensSwapped(msg.sender, 0, tokenAmount, ethToReceive, 0);
    }
}
