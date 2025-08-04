const { ethers } = require("hardhat");

async function main() {
    // WBT deploy
    const WBT = await ethers.getContractFactory("WBT");
    const wbt = await WBT.deploy();
    await wbt.deployed();
    console.log("WBT deployed to:", wbt.address);
    
    // WalletBank deploy
    const WalletBank = await ethers.getContractFactory("WalletBank");
    const walletBank = await WalletBank.deploy();
    await walletBank.deployed();
    console.log("WalletBank deployed to:", walletBank.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
