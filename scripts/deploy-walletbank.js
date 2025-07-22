const { ethers } = require("hardhat");

async function main() {
    const WalletBank = await ethers.getContractFactory("WalletBank");
    const walletBank = await WalletBank.deploy();
    console.log("WalletBank deployed to:", await walletBank.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
