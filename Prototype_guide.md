# 🏦 Investor & Finance User Testing Guide

Welcome to the **Asset Tokenization Platform**. This guide is designed for finance professionals, investors, and stakeholders who want to test the platform and understand the mechanics of fractional real-world asset (RWA) ownership.

---

## 📖 The Core Concept

Traditionally, high-value assets like premium real estate (e.g., a Heritage Haveli) or luxury goods require massive upfront capital, making them highly illiquid. 

**Our Solution:** We use blockchain technology to tokenize these assets. 
- A ₹1.8 Crore property is divided into 18,000 digital tokens.
- Each token represents a mathematically verifiable fractional share of the asset (₹1,000 per token).
- Investors can buy, hold, or trade these tokens globally, bringing immediate liquidity to historically illiquid markets.

---

## 🛠️ Step-by-Step: How to Test the Platform

To simulate a real investment on our platform, we use a testing environment on the Ethereum blockchain called the **Sepolia Testnet**. This uses "play money" so you can test the exact flow of a real transaction without spending actual capital.

### Step 1: Set Up Your Digital Wallet
1. Download and install **MetaMask** (a secure digital wallet) as a browser extension: [metamask.io](https://metamask.io/)
2. Follow the instructions to create a wallet. **Keep your secret recovery phrase safe.**
3. Open MetaMask, click on the network dropdown at the top left, toggle "Show test networks", and select **Sepolia**.

### Step 2: Get Test Funds (Sepolia ETH)
To pay for the transaction fees (gas) on the test network, you need test Ethereum.
1. Visit a Sepolia Faucet, such as [Alchemy Sepolia Faucet](https://sepoliafaucet.com/) or [Infura Faucet](https://www.infura.io/faucet/sepolia).
2. Copy your wallet address from MetaMask (starts with `0x...`) and paste it into the faucet to receive free Testnet ETH.

### Step 3: Make an Investment
1. Visit our live platform: [major-project-nu-rust.vercel.app](https://major-project-nu-rust.vercel.app/)
2. Browse the marketplace and select an asset (e.g., *Heritage Haveli*).
3. On the right side, in the **Buy Tokens** panel, enter the number of tokens you wish to purchase.
4. Click **Buy Tokens**.

### Step 4: Blockchain Confirmation
1. Your MetaMask wallet will automatically open, asking you to confirm the transaction.
2. Review the estimated gas fee (in Sepolia ETH) and click **Confirm**.
3. **Wait a few seconds:** The transaction is now being mathematically verified and permanently recorded on the global Ethereum blockchain. 
4. Once verified, the platform will automatically sync with the blockchain, deduct the tokens from the asset supply, and update your personal portfolio.

---

## 🔍 Why is this Revolutionary for Finance?

As you test the platform, notice what happens behind the scenes:

* **Immutable Ledger:** Your ownership is not stored on a private, alterable database. It is minted as a token on the public Ethereum blockchain. Ownership cannot be forged or altered.
* **Instant Settlement:** The transaction settles in seconds. There are no multi-day clearing houses, escrow delays, or complex paper trails.
* **Global Liquidity:** By tokenizing the asset, anyone in the world with a digital wallet can participate in the market, vastly increasing the pool of potential buyers and sellers.

---
*If you have any questions during your testing process or run into issues securing Testnet ETH, please reach out to me (Omkar Bharath Pukale).*
