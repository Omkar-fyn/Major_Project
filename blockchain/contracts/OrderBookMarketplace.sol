// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderBookMarketplace {
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

    event OrderPlaced(uint256 indexed orderId, address indexed user, uint256 amount, uint256 price, bool isBuyOrder);
    event OrderFilled(uint256 indexed orderId, address indexed filler, uint256 amountFilled, uint256 totalPrice);
    event OrderCancelled(uint256 indexed orderId, address indexed user);

    constructor(address _propertyToken) {
        propertyToken = IERC20(_propertyToken);
    }

    // Place a limit buy order (Deposit ETH)
    function placeBuyOrder(uint256 amount, uint256 price) external payable {
        uint256 totalCost = amount * price;
        require(msg.value == totalCost);

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
    function placeSellOrder(uint256 amount, uint256 price) external {
        require(propertyToken.transferFrom(msg.sender, address(this), amount));

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
    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.isActive);
        require(order.user == msg.sender);

        order.isActive = false;

        if (order.isBuyOrder) {
            uint256 refundEth = order.amount * order.price;
            (bool success, ) = payable(msg.sender).call{value: refundEth}("");
            require(success);
        } else {
            require(propertyToken.transfer(msg.sender, order.amount));
        }

        emit OrderCancelled(orderId, msg.sender);
    }

    // Fill an open order
    function fillOrder(uint256 orderId, uint256 amountToFill) external payable {
        Order storage order = orders[orderId];
        require(order.isActive);
        require(amountToFill > 0 && amountToFill <= order.amount);

        if (order.isBuyOrder) {
            // User is taking a BUY order (they are selling tokens to the order creator)
            require(propertyToken.transferFrom(msg.sender, order.user, amountToFill));
            
            uint256 ethToReceive = amountToFill * order.price;
            (bool success, ) = payable(msg.sender).call{value: ethToReceive}("");
            require(success);

        } else {
            // User is taking a SELL order (they are buying tokens from the order creator)
            uint256 ethCost = amountToFill * order.price;
            require(msg.value == ethCost);

            require(propertyToken.transfer(msg.sender, amountToFill));
            
            (bool success, ) = payable(order.user).call{value: ethCost}("");
            require(success);
        }

        order.amount -= amountToFill;
        if (order.amount == 0) {
            order.isActive = false;
        }

        emit OrderFilled(orderId, msg.sender, amountToFill, amountToFill * order.price);
    }
}
