# 🏗️ Asset Tokenization Platform - Technical Implementation Guide

Welcome to the comprehensive implementation documentation for the **Asset Tokenization Platform**. This document provides an in-depth breakdown of the system architecture, smart contracts, backend REST APIs, database schemas, frontend Web3 integration, transaction workflows, and step-by-step instructions to run the platform locally.

---

## 📐 System Architecture Overview

The platform bridges real-world assets (RWAs) with decentralized finance (DeFi) on the Ethereum Sepolia Testnet while maintaining an off-chain data ledger for fast queries and analytics.

```
                         ┌────────────────────────────────────────┐
                         │           NEXT.JS FRONTEND             │
                         │    (React, Ethers.js, Tailwind)        │
                         └──────────────────┬─────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   METAMASK / WEB3 WALLET  │                 │    EXPRESS BACKEND API    │
       │   (User signs transactions)│                 │   (Node.js REST Services) │
       └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                     │                                             │
                     │ (Executes Smart Contract calls)             │ (Syncs & stores metadata)
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   ETHEREUM BLOCKCHAIN     │                 │     MONGODB DATABASE      │
       │  (Sepolia Testnet Tokens) │                 │ (User portfolio & assets) │
       └───────────────────────────┘                 └───────────────────────────┘
```

---

## 📜 1. Blockchain & Smart Contracts Layer (`/blockchain`)

The blockchain subsystem handles token creation, minting, fractional ownership transfers, secondary trading order books, and liquidity management.

### Key Smart Contracts (`/blockchain/contracts/`)

#### 🔹 `PropertyToken.sol` (ERC-20 Fractional Token Contract)
- **Standard**: OpenZeppelin ERC-20 + `Ownable`.
- **Purpose**: Represents fractional ownership of a specific real-world asset (e.g., Real Estate, Luxury Goods).
- **Core Functions**:
  - `constructor(name, symbol, totalSupply, _pricePerToken, _propertyAddress)`: Deploys token contract and mints total supply to the platform admin.
  - `buyTokens(uint256 tokenCount)`: Payable function allowing users to purchase fractional tokens directly on-chain with Sepolia ETH.
  - `distributeRental()`: Distributes rental yields proportionally to token holders.
  - `mint(address to, uint256 amount)`: Admin function to mint additional fractional shares.
  - `burn(address from, uint256 amount)`: Admin function to destroy tokens upon redemption.

#### 🔹 `OrderBookMarketplace.sol` (Secondary Peer-to-Peer Trading)
- **Purpose**: Decentralized order book allowing users to buy and sell property tokens directly with peers without intermediaries.
- **Core Functions**:
  - `createBuyOrder(address token, uint256 amount, uint256 price)`
  - `createSellOrder(address token, uint256 amount, uint256 price)`
  - `executeOrder(uint256 orderId)`

#### 🔹 `BondingCurveAMM.sol` (Automated Market Maker Liquidity Pool)
- **Purpose**: Provides instant liquidity using a continuous bonding curve pricing algorithm ($P = f(Supply)$), enabling users to liquidate or purchase tokens even when no matching peer order exists.

---

## ⚙️ 2. Backend API & Data Layer (`/server`)

Built with **Node.js, Express, and MongoDB (Mongoose ORM)**, the backend manages off-chain data (asset descriptions, images, legal documents) and reconciles state with the Sepolia blockchain via **Infura RPC**.

### Database Schemas (`/server/models`)

1. **`Asset.js`**:
   - `title`, `description`, `category` (Real Estate, Fine Art, Watches).
   - `totalValuation`, `pricePerToken`, `totalSupply`, `availableTokens`.
   - `contractAddress`: Deployed ERC-20 property contract address on Sepolia.
   - `imageUrl`, `location`, `documents`.

2. **`User.js`**:
   - `walletAddress` (unique Ethereum wallet address, stored in lower-case).
   - `email`, `name`, `role` (`user` / `admin`).

3. **`Ownership.js`**:
   - Links `user` ID to `asset` ID and records `tokensOwned` and `purchasePrice`.

4. **`Transaction.js`**:
   - `user`, `asset`, `txHash`, `tokenAmount`, `totalCost`, `status` (`pending`, `confirmed`, `failed`), `type` (`buy`, `sell`).

### Core REST API Endpoints

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate or auto-register user via Web3 wallet address |
| `/api/assets` | `GET` | List all tokenized assets listed on the marketplace |
| `/api/assets/:id` | `GET` | Retrieve detailed information & smart contract address for an asset |
| `/api/assets` | `POST` | Admin endpoint to mint and list a new tokenized asset |
| `/api/transactions/buy` | `POST` | Record primary market token purchase and initiate off-chain sync |
| `/api/user/portfolio` | `GET` | Retrieve logged-in user's token portfolio and transaction history |

---

## 🖥️ 3. Frontend UI & Web3 Layer (`/client`)

Built with **Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, and `ethers.js`**.

### Core Pages & Components

1. **Marketplace Homepage (`app/page.js`)**:
   - Displays all active assets with real-time token availability, valuation badges, and filters by category.

2. **Asset Detail & Investment Panel (`app/assets/[id]/page.js`)**:
   - Detailed property information, financial metrics (Yield %, Minimum Investment, Total Valuation).
   - Interactive **Buy Tokens** calculator panel.
   - Connects directly to **MetaMask** using `ethers.BrowserProvider`.

3. **Portfolio Dashboard (`app/dashboard/page.js`)**:
   - Displays total invested value, active fractional tokens owned, estimated rental dividend earnings, and past transaction status log.

4. **Admin Minting Panel (`app/admin/page.js`)**:
   - Interface for asset managers to upload property details and trigger smart contract deployments.

---

## 🔄 4. End-to-End Transaction Flow

Here is the sequence of events during a token purchase:

```
[User Selects Asset & Enters Quantity]
                 │
                 ▼
[Clicks "Buy Tokens"] ───► [Frontend triggers contract call via MetaMask]
                                 │
                                 ▼
                     [User Approves Transaction in MetaMask]
                                 │
                                 ▼
                     [Transaction Mined on Sepolia Blockchain]
                                 │
                                 ▼
[Frontend receives txHash & posts to `/api/transactions/buy`]
                                 │
                                 ▼
[Backend Infura RPC verifies txHash on Sepolia]
                                 │
                                 ▼
[MongoDB Updates: Asset supply reduced & User Ownership record updated]
```

---

## 🚀 5. Local Setup & Execution Guide

Follow these steps to set up and run the entire project on a new environment:

### Step 1: Backend Setup (`/server`)
```bash
cd server
npm install
```
Create a `.env` file inside `/server`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```
Start backend:
```bash
npm run dev
```

### Step 2: Frontend Setup (`/client`)
```bash
cd client
npm install
```
Create a `.env.local` file inside `/client`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Start frontend:
```bash
npm run dev
```

### Step 3: Smart Contract Deployment (`/blockchain`)
```bash
cd blockchain
npm install
```
Create a `.env` file inside `/blockchain`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key
```
Deploy contracts to Sepolia:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```
