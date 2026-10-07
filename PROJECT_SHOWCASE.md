# Asset Tokenization Platform - Project Showcase

Welcome to the Asset Tokenization Platform! This document explains how the project works, how to run it locally, and provides placeholders where you can add screenshots to present to others.

---

## 🏗️ How the Project Works

This platform allows users to buy and sell fractional ownership of real-world assets (like real estate, luxury watches, and art) using blockchain technology.

### The Tech Stack
1. **Frontend (`client/`)**: Built with **Next.js** and React. It provides a beautiful UI for users to browse assets, view their portfolio, and interact with the blockchain using `ethers.js`.
2. **Backend (`server/`)**: Built with **Node.js, Express, and MongoDB**. It manages user authentication, stores asset details, and keeps a synchronized record of all blockchain transactions.
3. **Blockchain (`blockchain/`)**: Built with **Hardhat** and Solidity. Smart contracts deployed on the **Sepolia Testnet** handle the actual minting and transferring of tokens to represent asset ownership.

### The Transaction Flow
1. A user clicks "Buy Tokens" on the frontend.
2. MetaMask pops up and asks the user to confirm the transaction on the **Sepolia Testnet**.
3. Once the transaction is mined on the blockchain, the frontend sends the transaction hash to the backend.
4. The backend verifies the transaction using the Infura RPC.
5. If valid, the backend updates the user's portfolio and deducts the tokens from the asset's available supply.

---

## 📸 Presentation & Screenshots

*(You can add your images here by dragging and dropping them into this Markdown file in VS Code, or using standard markdown syntax like `![Screenshot Name](./path/to/image.png)`)*

### 1. Home Page / Asset Marketplace
*Add a screenshot showing the list of available assets.*
![Marketplace Placeholder](https://via.placeholder.com/800x400?text=Insert+Marketplace+Screenshot+Here)

### 2. Asset Details & Buying
*Add a screenshot showing the Heritage Haveli details and the "Buy Tokens" panel.*
![Asset Details Placeholder](https://via.placeholder.com/800x400?text=Insert+Asset+Details+Screenshot+Here)

### 3. MetaMask Confirmation
*Add a screenshot of the MetaMask popup confirming the Sepolia transaction.*
![MetaMask Placeholder](https://via.placeholder.com/800x400?text=Insert+MetaMask+Screenshot+Here)

### 4. User Portfolio Dashboard
*Add a screenshot showing the updated balance and fractional ownership in the user's dashboard.*
![Dashboard Placeholder](https://via.placeholder.com/800x400?text=Insert+Dashboard+Screenshot+Here)

---

## 🚀 How to Run the Project Locally

If you need to run the entire project from scratch on a new machine, follow these steps:

### 1. Prerequisites
- Install **Node.js** (v18+ recommended)
- Install **MetaMask** browser extension and get some Sepolia test ETH from a faucet.
- Ensure you have your `.env` files set up in both the `server/` and `blockchain/` folders.

### 2. Start the Backend
Open a terminal and run:
```bash
cd server
npm install
npm run dev
```
*The backend will start on `http://localhost:5000` and connect to MongoDB and Sepolia.*

### 3. Start the Frontend
Open a second terminal and run:
```bash
cd client
npm install
npm run dev
```
*The frontend will start on `http://localhost:3000`.*

### 4. Smart Contracts (Optional)
If you ever need to deploy new smart contracts:
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

---

*This document is a living file. Feel free to modify it, add more sections, or drag and drop your screenshots directly into VS Code to build your final presentation!*
