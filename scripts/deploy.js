const { ethers } = require("hardhat");

async function main() {
    const WBT = await ethers.getContractFactory("WBT");
    const wbt = await WBT.deploy();
    console.log("WBT deployed to:", await wbt.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
