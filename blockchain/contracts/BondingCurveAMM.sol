// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BondingCurveAMM is ReentrancyGuard, Ownable {
    IERC20 public propertyToken;

    uint256 public reserveETH;
    uint256 public reserveToken;

    error InvalidAmounts();
    error TokenTransferFailed();
    error InvalidReserves();
    error MustSendETH();
    error MustSendTokens();
    error InsufficientOutputAmount();
    error InsufficientLiquidity();
    error ETHTransferFailed();

    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokenAmount);
    event TokensSwapped(address indexed user, uint256 ethIn, uint256 tokenIn, uint256 ethOut, uint256 tokenOut);

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = IERC20(_propertyToken);
    }

    // Add initial liquidity to establish the curve (Constant Product x * y = k)
    function addLiquidity(uint256 tokenAmount) external payable onlyOwner nonReentrant {
        if (msg.value == 0 || tokenAmount == 0) revert InvalidAmounts();
        
        if (!propertyToken.transferFrom(msg.sender, address(this), tokenAmount)) revert TokenTransferFailed();

        reserveETH += msg.value;
        reserveToken += tokenAmount;

        emit LiquidityAdded(msg.sender, msg.value, tokenAmount);
    }

    // Get the price based on x * y = k formula
    // outputAmount = (outputReserve * inputAmount) / (inputReserve + inputAmount)
    function getAmountOut(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        if (inputReserve == 0 || outputReserve == 0) revert InvalidReserves();
        uint256 inputAmountWithFee = inputAmount * 997; // 0.3% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }

    // Buy tokens with ETH
    function buyTokens() external payable nonReentrant {
        if (msg.value == 0) revert MustSendETH();
        
        uint256 tokensToReceive = getAmountOut(msg.value, reserveETH, reserveToken);
        if (tokensToReceive == 0) revert InsufficientOutputAmount();
        if (reserveToken < tokensToReceive) revert InsufficientLiquidity();

        reserveETH += msg.value;
        reserveToken -= tokensToReceive;

        if (!propertyToken.transfer(msg.sender, tokensToReceive)) revert TokenTransferFailed();

        emit TokensSwapped(msg.sender, msg.value, 0, 0, tokensToReceive);
    }

    // Sell tokens for ETH
    function sellTokens(uint256 tokenAmount) external nonReentrant {
        if (tokenAmount == 0) revert MustSendTokens();

        uint256 ethToReceive = getAmountOut(tokenAmount, reserveToken, reserveETH);
        if (ethToReceive == 0) revert InsufficientOutputAmount();
        if (reserveETH < ethToReceive) revert InsufficientLiquidity();

        if (!propertyToken.transferFrom(msg.sender, address(this), tokenAmount)) revert TokenTransferFailed();

        reserveToken += tokenAmount;
        reserveETH -= ethToReceive;

        (bool success, ) = payable(msg.sender).call{value: ethToReceive}("");
        if (!success) revert ETHTransferFailed();

        emit TokensSwapped(msg.sender, 0, tokenAmount, ethToReceive, 0);
    }
}
