# WalletBank – Smart Wallet with ETH & ERC20 Deposit
# Overview
WalletBank is a smart contract system designed to handle both native ETH and ERC20 tokens in a secure and transparent way. It works like a personal blockchain based bank where users can deposit and withdraw ETH or supported ERC20 tokens (WBT Token in this project).

# The project demonstrates:

Basic banking logic: deposit, withdraw, transfer.
Token handling: ERC20 token (WBT) with approve & depositToken flow.
Transaction history tracking: storing user deposits with timestamps.

# Features
ETH Deposit & Withdraw: Users can send ETH into the contract and later withdraw it.
ERC20 Support (WBT Token): Deposit and withdraw custom ERC20 tokens.
Secure Balance Tracking: Individual user balances are stored inside the contract.
Events & History: Every deposit is logged with events and can be queried by user.
Local & Testnet Ready: Can be tested on Hardhat local network or Sepolia testnet.

# Installation
Clone this repository:
git clone https://github.com/sida-metin/SmartWallet-Blockchain.git
cd SmartWallet-Blockchain
Install dependencies:
yarn install
Compile contracts:
yarn hardhat compile

# Deploying Contracts
Local Hardhat Network

Start local Hardhat node:
yarn hardhat node

Deploy contracts locally:
yarn hardhat run scripts/deploy.js --network localhost
yarn hardhat run scripts/deploy-walletbank.js --network localhost


# Sepolia Testnet
Make sure you have:
A Sepolia RPC URL (from Infura or Alchemy).
A funded MetaMask account with Sepolia ETH.

Update hardhat.config.js with your .env values:
SEPOLIA_RPC_URL=<your_rpc_url>
PRIVATE_KEY=<your_metamask_private_key>

Then deploy:
yarn hardhat run scripts/deploy.js --network sepolia







