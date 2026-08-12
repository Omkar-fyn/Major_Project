// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OrderBookMarketplace is ReentrancyGuard {
    IERC20 public propertyToken;

    struct Order {
        uint256 id;
        uint256 amount;
        uint256 price; // Price per token in wei
        address user;
        bool isBuyOrder;
        bool isActive;
    }

    uint256 public nextOrderId;
    mapping(uint256 => Order) public orders;

    error IncorrectETHSent();
    error TokenTransferFailed();
    error OrderNotActive();
    error NotOrderOwner();
    error ETHTransferFailed();
    error InvalidAmountToFill();

    event OrderPlaced(uint256 indexed orderId, address indexed user, uint256 amount, uint256 price, bool isBuyOrder);
    event OrderFilled(uint256 indexed orderId, address indexed filler, uint256 amountFilled, uint256 totalPrice);
    event OrderCancelled(uint256 indexed orderId, address indexed user);

    constructor(address _propertyToken) {
        propertyToken = IERC20(_propertyToken);
    }

    // Place a limit buy order (Deposit ETH)
    function placeBuyOrder(uint256 amount, uint256 price) external payable nonReentrant {
        uint256 totalCost = amount * price;
        if (msg.value != totalCost) revert IncorrectETHSent();

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            amount: amount,
            price: price,
            user: msg.sender,
            isBuyOrder: true,
            isActive: true
        });

        emit OrderPlaced(orderId, msg.sender, amount, price, true);
    }

    // Place a limit sell order (Deposit Tokens)
    function placeSellOrder(uint256 amount, uint256 price) external nonReentrant {
        if (!propertyToken.transferFrom(msg.sender, address(this), amount)) revert TokenTransferFailed();

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            amount: amount,
            price: price,
            user: msg.sender,
            isBuyOrder: false,
            isActive: true
        });

        emit OrderPlaced(orderId, msg.sender, amount, price, false);
    }

    // Cancel an order
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        if (!order.isActive) revert OrderNotActive();
        if (order.user != msg.sender) revert NotOrderOwner();

        order.isActive = false;

        if (order.isBuyOrder) {
            uint256 refundEth = order.amount * order.price;
            (bool success, ) = payable(msg.sender).call{value: refundEth}("");
            if (!success) revert ETHTransferFailed();
        } else {
            if (!propertyToken.transfer(msg.sender, order.amount)) revert TokenTransferFailed();
        }

        emit OrderCancelled(orderId, msg.sender);
    }

    // Fill an open order
    function fillOrder(uint256 orderId, uint256 amountToFill) external payable nonReentrant {
        Order storage order = orders[orderId];
        if (!order.isActive) revert OrderNotActive();
        if (amountToFill == 0 || amountToFill > order.amount) revert InvalidAmountToFill();

        if (order.isBuyOrder) {
            // User is taking a BUY order (they are selling tokens to the order creator)
            if (!propertyToken.transferFrom(msg.sender, order.user, amountToFill)) revert TokenTransferFailed();
            
            uint256 ethToReceive = amountToFill * order.price;
            (bool success, ) = payable(msg.sender).call{value: ethToReceive}("");
            if (!success) revert ETHTransferFailed();

        } else {
            // User is taking a SELL order (they are buying tokens from the order creator)
            uint256 ethCost = amountToFill * order.price;
            if (msg.value != ethCost) revert IncorrectETHSent();

            if (!propertyToken.transfer(msg.sender, amountToFill)) revert TokenTransferFailed();
            
            (bool success, ) = payable(order.user).call{value: ethCost}("");
            if (!success) revert ETHTransferFailed();
        }

        order.amount -= amountToFill;
        if (order.amount == 0) {
            order.isActive = false;
        }

        emit OrderFilled(orderId, msg.sender, amountToFill, amountToFill * order.price);
    }
}
