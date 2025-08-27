const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TradingGame", function(){
    let tradingGame, owner, player1, player2, wbtToken;

    beforeEach(async function(){
        // WBT token'ını deploy et
        const WBT = await ethers.getContractFactory("WBT");
        wbtToken = await WBT.deploy();
        
        // TradingGame contract'ını deploy et
        const TradingGame = await ethers.getContractFactory("TradingGame");
        tradingGame = await TradingGame.deploy(wbtToken.address);

        [owner, player1, player2] = await ethers.getSigners();
    });

    it("should pay the entry fee to join the game", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        
        const playerInfo = await tradingGame.playerInfo(player1.address);
        expect(playerInfo.isActive).to.be.true;
    });

    it("should not allow player to join twice", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        
        await expect(
            tradingGame.connect(player1).joinGame({value: entryFee})
        ).to.be.revertedWith("You already joined the game!");
    });
});