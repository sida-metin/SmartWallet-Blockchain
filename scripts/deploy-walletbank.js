const { ethers } = require("hardhat");

async function main() {
    const WalletBank = await ethers.getContractFactory("WalletBank");
    const walletBank = await WalletBank.deploy();
    await walletBank.deployed();
    console.log("WalletBank deployed to:", walletBank.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
