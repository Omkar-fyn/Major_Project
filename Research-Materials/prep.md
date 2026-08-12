1. Start with a 1-minute project explanation

If they ask:

"Explain your project."

Answer:

Our project is an Asset Tokenization System that enables real-world assets such as real estate to be represented as blockchain tokens. Instead of purchasing an entire asset, investors can buy fractional ownership through tokens. We use blockchain to ensure transparent ownership records, secure transactions, and immutable transaction history. The frontend is built with React, the backend uses Node.js and Express, MongoDB stores application data, and Solidity smart contracts on Ethereum manage token ownership and transfers.

2. What is Asset Tokenization?

Asset tokenization is the process of converting ownership of a real-world asset into digital tokens on a blockchain.

Example:

A property worth

₹1 Crore

↓

Divide into

1,000,000 tokens

↓

Each token

=

0.0001% ownership

Instead of buying the entire property, investors buy tokens.

3. Why blockchain?

Without blockchain:

Central authority controls records.
Records can potentially be altered.
Less transparency.

With blockchain:

Immutable records.
Transparent transactions.
Decentralized verification.
Smart contract automation.
Reduced fraud risk.
4. Why not use a normal database?

This is a very common question.

MongoDB stores:

User profiles
Asset descriptions
Images
Login information

Blockchain stores:

Ownership
Token balances
Transactions
Smart contract state

Why?

Because MongoDB data can be modified by administrators.

Blockchain data is immutable once confirmed.

5. Why MongoDB if blockchain already stores data?

Because storing everything on Ethereum is expensive.

Blockchain storage is costly.

Store only critical data:

Token ownership
Transactions

Store off-chain:

Images
Asset descriptions
User profiles
KYC status
Contact information

This is called a hybrid architecture.

6. Why Ethereum?

Ethereum supports:

Smart contracts
ERC-20 standard
Large ecosystem
Security
Decentralized execution
7. What is Solidity?

Solidity is the programming language used to write Ethereum smart contracts.

Like:

Python → AI

Java → Android

Solidity → Ethereum Smart Contracts

8. What is a Smart Contract?

A smart contract is a self-executing program stored on the blockchain.

Example:

If payment is successful

↓

Transfer tokens automatically

No human intervention is needed.

9. What is MetaMask?

MetaMask is a crypto wallet.

It is used to:

Store private keys
Sign transactions
Connect users to your dApp
Pay gas fees

It does not store the blockchain.

10. What is Hardhat?

Hardhat is the development environment for Ethereum.

It helps developers:

Compile contracts
Deploy contracts
Test contracts
Debug contracts

Think of it as the development toolkit for Solidity.

11. What is a Wallet Address?

Example:

0xA7B4...

It is a public identifier.

Anyone can see it.

It is similar to an email address for receiving crypto.

12. Private Key

Never share it.

The private key proves ownership of the wallet.

Wallet Address:

Public

Private Key:

Secret

13. Can people know the user's identity?

No.

Blockchain stores only:

Wallet Address

↓

Transactions

Not:

Name
Phone
Aadhaar
PAN
Email

Unless the company performs KYC.

14. What is msg.sender?

Very important.

msg.sender

=

The wallet address that called the smart contract.

Example:

User Wallet

↓

Calls buyToken()

↓

msg.sender

=

that wallet address

It identifies the caller.

15. Can everyone see msg.sender?

Yes.

Because blockchain transactions are public.

But they cannot know the person's identity unless it has been linked off-chain.

16. What is Gas?

Gas is the fee paid to execute operations on Ethereum.

Why?

Validators perform computation.

They must be compensated.

Gas prevents spam transactions.

17. Why is gas needed?

Without gas,

someone could submit millions of transactions and overload the network.

Gas discourages abuse and pays validators.

18. ERC-20

ERC

=

Ethereum Request for Comments

ERC-20

=

Standard for fungible tokens.

Functions include:

transfer()
balanceOf()
approve()
transferFrom()
19. Difference between ERC-20 and NFT

ERC-20

Fungible
Every token is identical

NFT

Unique
Every token has a different identity

Your project uses ERC-20 because fractional ownership tokens are interchangeable.

20. What is Decentralization?

Instead of one server,

thousands of blockchain nodes store the same ledger.

No single authority controls it.

21. Consensus

Nodes agree on the correct blockchain state.

Ethereum currently uses

Proof of Stake.

Validators confirm transactions.

22. What happens when someone buys tokens?
User connects MetaMask.
User clicks Buy.
Frontend calls the smart contract.
MetaMask asks the user to sign.
Transaction is sent.
Validators confirm it.
Smart contract transfers or mints tokens.
Blockchain updates ownership.
Frontend refreshes the balance.
23. What happens when selling?
User requests sale.
Smart contract verifies ownership.
Tokens are transferred or burned (depending on the design).
Ownership records update.
24. Why blockchain instead of Google Sheets?

Blockchain provides:

Tamper resistance
Transparency
Distributed trust
Cryptographic verification

Google Sheets does not.

25. What is Token Minting?

Minting

=

Creating new blockchain tokens.

Example:

Property

↓

Smart Contract

↓

1,000,000 tokens created

26. What is Burning?

Burning permanently destroys tokens.

Supply decreases.

27. What is Fractional Ownership?

Instead of buying:

100% of a property

You buy

0.1%

through tokens.

28. Why React?

React provides:

Fast UI updates
Component-based architecture
Good integration with Web3 libraries
29. Why Node.js?

Node.js handles:

APIs
Authentication
Database communication
Business logic
30. Why Express?

Express simplifies backend routing and API development.

31. Why MongoDB?

MongoDB is flexible for storing:

Users
Assets
Images
Metadata
32. Where is ownership stored?

Ownership of the tokens is stored on the blockchain.

Asset details are stored in MongoDB.

33. Advantages
Fractional investment
Global accessibility
Transparency
Security
Faster settlement
Lower intermediary costs
34. Limitations
Regulatory compliance
Gas fees
Blockchain scalability
KYC/AML requirements
Dependence on wallet management
35. Future Enhancements
Real Ethereum Mainnet deployment
Secondary marketplace
NFT-based property certificates
DAO governance
AI-based investment recommendations
Multi-chain support
Integrated KYC/AML
Mobile application
Questions the panel will almost certainly ask
Q1: Why blockchain?

Answer: To provide immutable ownership records, transparency, and decentralized trust.

Q2: Why not use only MongoDB?

Answer: MongoDB stores application data, while blockchain securely stores ownership and transactions that should not be altered.

Q3: What is MetaMask?

Answer: A wallet that stores users' private keys, signs transactions, and connects the browser to Ethereum.

Q4: What is Hardhat?

Answer: A Solidity development environment used to compile, test, and deploy smart contracts.

Q5: What is msg.sender?

Answer: The wallet address of the account calling the smart contract.

Q6: Can anyone see blockchain transactions?

Answer: Yes. Transactions and wallet addresses are public, but personal identity is not stored on the blockchain.

Q7: What is the biggest advantage of your project?

Answer: It enables fractional ownership while using blockchain to provide secure, transparent, and tamper-resistant ownership records.