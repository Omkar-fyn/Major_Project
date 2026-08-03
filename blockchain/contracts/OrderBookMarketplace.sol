// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OrderBookMarketplace is ReentrancyGuard {
    IERC20 public propertyToken;

    struct Order {
        uint256 id;
        address user;
        uint256 amount;
        uint256 price; // Price per token in wei
        bool isBuyOrder;
        bool isActive;
    }

    uint256 public nextOrderId;
    mapping(uint256 => Order) public orders;
    
    // Arrays to keep track of active orders (for easier frontend fetching)
    uint256[] public activeBuyOrders;
    uint256[] public activeSellOrders;

    event OrderPlaced(uint256 indexed orderId, address indexed user, uint256 amount, uint256 price, bool isBuyOrder);
    event OrderFilled(uint256 indexed orderId, address indexed filler, uint256 amountFilled, uint256 totalPrice);
    event OrderCancelled(uint256 indexed orderId, address indexed user);

    constructor(address _propertyToken) {
        propertyToken = IERC20(_propertyToken);
    }

    // Place a limit buy order (Deposit ETH)
    function placeBuyOrder(uint256 amount, uint256 price) external payable nonReentrant {
        uint256 totalCost = amount * price;
        require(msg.value == totalCost, "Incorrect ETH sent");

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            user: msg.sender,
            amount: amount,
            price: price,
            isBuyOrder: true,
            isActive: true
        });

        activeBuyOrders.push(orderId);
        emit OrderPlaced(orderId, msg.sender, amount, price, true);
    }

    // Place a limit sell order (Deposit Tokens)
    function placeSellOrder(uint256 amount, uint256 price) external nonReentrant {
        require(propertyToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            user: msg.sender,
            amount: amount,
            price: price,
            isBuyOrder: false,
            isActive: true
        });

        activeSellOrders.push(orderId);
        emit OrderPlaced(orderId, msg.sender, amount, price, false);
    }

    // Cancel an order
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.isActive, "Order not active");
        require(order.user == msg.sender, "Not order owner");

        order.isActive = false;

        if (order.isBuyOrder) {
            uint256 refundEth = order.amount * order.price;
            (bool success, ) = payable(msg.sender).call{value: refundEth}("");
            require(success, "ETH transfer failed");
        } else {
            require(propertyToken.transfer(msg.sender, order.amount), "Token transfer failed");
        }

        emit OrderCancelled(orderId, msg.sender);
    }

    // Fill an open order
    function fillOrder(uint256 orderId, uint256 amountToFill) external payable nonReentrant {
        Order storage order = orders[orderId];
        require(order.isActive, "Order not active");
        require(amountToFill > 0 && amountToFill <= order.amount, "Invalid amount to fill");

        if (order.isBuyOrder) {
            // User is taking a BUY order (they are selling tokens to the order creator)
            require(propertyToken.transferFrom(msg.sender, order.user, amountToFill), "Token transfer failed");
            
            uint256 ethToReceive = amountToFill * order.price;
            (bool success, ) = payable(msg.sender).call{value: ethToReceive}("");
            require(success, "ETH transfer failed");

        } else {
            // User is taking a SELL order (they are buying tokens from the order creator)
            uint256 ethCost = amountToFill * order.price;
            require(msg.value == ethCost, "Incorrect ETH sent");

            require(propertyToken.transfer(msg.sender, amountToFill), "Token transfer failed");
            
            (bool success, ) = payable(order.user).call{value: ethCost}("");
            require(success, "ETH transfer failed");
        }

        order.amount -= amountToFill;
        if (order.amount == 0) {
            order.isActive = false;
        }

        emit OrderFilled(orderId, msg.sender, amountToFill, amountToFill * order.price);
    }
}
