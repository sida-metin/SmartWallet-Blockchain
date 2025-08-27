const { expect } = require("chai");
const { ethers } = require("hardhat");

describe( "WalletBank", function(){
    let wallet,owner,reciever;

    this.beforeEach(async function() {
        //Wallet contractını deploy et
        const Wallet = await ethers.getContractFactory("WalletBank");
        wallet = await Wallet.deploy();

        //Hesapları al
        [owner, reciever] = await ethers.getSigners();
    });

    it("should add the amount after deposit", async function() {
        await wallet.deposit({ value: ethers.parseEther("1") });
        expect (await wallet.balance(owner.address)).to.equal(ethers.parseEther("1"));
    });

    it("should emit DepositMade event on deposit", async function() {
        const depositAmount = ethers.parseEther("1");
        await expect(wallet.deposit({ value: depositAmount }))
            .to.emit(wallet, "DepositMade");
    });

    it("should transfer the amount to the receiver", async function() {
        await wallet.deposit({ value: ethers.parseEther("1") }); // payable ise value kullanılır, değilse kullanılmaz asagıdaki gibi
        await wallet.transfer(reciever.address, ethers.parseEther("0.5"));
        expect(await wallet.balance(owner.address)).to.equal(ethers.parseEther("0.5"));
        expect(await wallet.balance(reciever.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("should withdraw the amount", async function() {
        await wallet.deposit({value: ethers.parseEther("1")});
        await wallet.withdraw(ethers.parseEther("0.5"));
        expect(await wallet.balance(owner.address)).to.equal(ethers.parseEther("0.5"));
    });

});