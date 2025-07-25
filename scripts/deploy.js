const { ethers } = require("hardhat");

async function main() {
    const WBT = await ethers.getContractFactory("WBT");
    const wbt = await WBT.deploy();
    await wbt.deployed();
    console.log("WBT deployed to:", wbt.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
