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

    it("should owner add the pet to the game", async function(){
       await tradingGame.connect(owner).addPet(1, "Cat", "Male", 100, "Legendary", 100, 100, 100, player1.address, 100, false, 0);
       const pets = await tradingGame.getAllPets();
       expect(pets.length).to.be.greaterThan(0);
    });

    it("should not allow players to add pet", async function(){
        await expect(
            tradingGame.connect(player1).addPet(1, "Cat", "Male", 100, "Legendary", 100, 100, 100, ethers.ZeroAddress, 100, false, 0)
        ).to.be.reverted;
    });

    it("should player buy and sell the pet", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        await tradingGame.connect(player2).joinGame({value: entryFee});
        await tradingGame.connect(owner).addPet(1, "Cat", "Male", 100, "Legendary", 100, 100, 100, owner.address, 100, true, 0);
        await tradingGame.connect(player1).buyPet(0);       
        await tradingGame.connect(player1).petForSale(0, 150);
        await tradingGame.connect(player2).buyPet(0);
    });

    it("should player to feed the pet", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        await tradingGame.connect(owner).addPet(1, "Cat", "Male", 100, "Legendary", 69, 100, 100, owner.address, 100, true, 0);
        await tradingGame.connect(player1).buyPet(0);
        await tradingGame.connect(player1).feedPet(0);
    });

    it("should let player to like the pet", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        await tradingGame.connect(player2).joinGame({value: entryFee});
        await tradingGame.connect(owner).addPet(1, "Cat", "Male", 100, "Legendary", 69, 100, 100, owner.address, 100, true, 0);
        await tradingGame.connect(player1).buyPet(0);
        await tradingGame.connect(player2).likePet(0);
    });

    it("should let player to cancel the pet sale", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        await tradingGame.connect(owner).addPet(1, "Cat", "Male", 100, "Legendary", 69, 100, 100, owner.address, 100, true, 0);
        await tradingGame.connect(player1).buyPet(0);
        await tradingGame.connect(player1).petForSale(0, 150);
        await tradingGame.connect(player1).cancelPetSale(0);
    });

    it("should let player to claim the daily reward", async function(){
        const entryFee = await tradingGame.entryFee();
        await tradingGame.connect(player1).joinGame({value: entryFee});
        
        // 24 saat sonra tekrar ödül alabilir
        await ethers.provider.send("evm_increaseTime", [86400]); // 24 saat
        await ethers.provider.send("evm_mine");
        await tradingGame.connect(player1).dailyReward();
    });

});