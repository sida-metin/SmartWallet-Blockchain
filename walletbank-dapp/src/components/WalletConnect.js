


import { useState, useEffect } from "react";
import "./WalletConnect.css";
import { Contract, BrowserProvider, formatUnits, parseUnits } from "ethers";
import { WALLETBANK_ADDRESS, WALLETBANK_ABI, WBT_ADDRESS, WBT_ABI } from "../contracts/addresses";

function WalletConnect() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // WBT
  const [wbtBalance, setWbtBalance] = useState(0);
  const [wbtDecimals, setWbtDecimals] = useState(18);
  const [wbtSymbol, setWbtSymbol] = useState("WBT");
  const [wbtTransferTo, setWbtTransferTo] = useState("");
  const [wbtTransferAmount, setWbtTransferAmount] = useState("");

  // Web3.js veya ethers.js ile kontrat çağrısı için
  // WBT bakiyesini blockchain'den oku
  // Hem ETH hem WBT bakiyesini blockchain'den oku
  useEffect(() => {
    if (window.ethereum && account) {
      const getBalances = async () => {
        try {
          const provider = new BrowserProvider(window.ethereum);
          // WBT
          const wbtContract = new Contract(WBT_ADDRESS, WBT_ABI, provider);
          const decimals = await wbtContract.decimals();
          setWbtDecimals(Number(decimals));
          const symbol = await wbtContract.symbol();
          setWbtSymbol(symbol);
          const wbtBal = await wbtContract.balanceOf(account);
          setWbtBalance(Number(formatUnits(wbtBal, decimals)));
          // ETH (WalletBank kontratındaki bakiye)
          const walletBank = new Contract(WALLETBANK_ADDRESS, WALLETBANK_ABI, provider);
          const ethBal = await walletBank.ethBalanceOf(account);
          setBalance(Number(formatUnits(ethBal, 18)));
        } catch (e) {
          setWbtBalance(0);
          setBalance(0);
        }
      };
      getBalances();
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      // Bakiye otomatik güncellenecek
    } else {
      alert("MetaMask not found. Please install it.");
    }
  };


  // Gerçek ETH deposit (WalletBank'a ETH gönder)
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("MetaMask not found");
    if (!depositAmount || Number(depositAmount) <= 0) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(WALLETBANK_ADDRESS, WALLETBANK_ABI, signer);
      const tx = await contract.deposit({ value: parseUnits(depositAmount, 18) });
      await tx.wait();
      setDepositAmount("");
      // Bakiye güncelle
      const ethBal = await contract.ethBalanceOf(account);
      setBalance(Number(formatUnits(ethBal, 18)));
      alert("Deposit başarılı!");
    } catch (err) {
      alert("Deposit başarısız: " + (err?.reason || err?.message || err));
    }
  };

  // Gerçek ETH withdraw (WalletBank'tan çek)
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("MetaMask not found");
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(WALLETBANK_ADDRESS, WALLETBANK_ABI, signer);
      const amount = parseUnits(withdrawAmount, 18);
      const tx = await contract.withdraw(amount);
      await tx.wait();
      setWithdrawAmount("");
      // Bakiye güncelle
      const ethBal = await contract.ethBalanceOf(account);
      setBalance(Number(formatUnits(ethBal, 18)));
      alert("Withdraw başarılı!");
    } catch (err) {
      alert("Withdraw başarısız: " + (err?.reason || err?.message || err));
    }
  };

  // Gerçek ETH transfer (WalletBank üzerinden başka adrese transfer)
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("MetaMask not found");
    if (!transferTo || !transferAmount || Number(transferAmount) <= 0) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(WALLETBANK_ADDRESS, WALLETBANK_ABI, signer);
      const amount = parseUnits(transferAmount, 18);
      const tx = await contract.transferEth(transferTo, amount);
      await tx.wait();
      setTransferAmount("");
      setTransferTo("");
      // Bakiye güncelle
      const ethBal = await contract.ethBalanceOf(account);
      setBalance(Number(formatUnits(ethBal, 18)));
      alert("Transfer başarılı!");
    } catch (err) {
      alert("Transfer başarısız: " + (err?.reason || err?.message || err));
    }
  };


  // Gerçek WBT transfer işlemi
  const handleWbtTransfer = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("MetaMask not found");
    if (!wbtTransferTo || !wbtTransferAmount) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(WBT_ADDRESS, WBT_ABI, signer);
      const decimals = wbtDecimals;
      const amount = parseUnits(wbtTransferAmount, decimals);
      const tx = await contract.transfer(wbtTransferTo, amount);
      await tx.wait();
      setWbtTransferAmount("");
      setWbtTransferTo("");
      // Transfer sonrası bakiyeyi güncelle
      const bal = await contract.balanceOf(account);
      setWbtBalance(Number(formatUnits(bal, decimals)));
      alert("Transfer başarılı!");
    } catch (err) {
      alert("Transfer başarısız: " + (err?.reason || err?.message || err));
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-card">
        <div className="wallet-header">
          <span className="wallet-logo">💳 WalletBank</span>
          {account ? (
            <span className="account">{account.slice(0, 6)}...{account.slice(-4)}</span>
          ) : (
            <button className="connect-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        {account && (
          <>
            <div className="wallet-balance">
              <span>Bakiye:</span>
              <span className="balance-amount">{balance} ETH</span>
            </div>
            <form className="wallet-form" onSubmit={handleDeposit}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Deposit (ETH)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
              />
              <button type="submit" className="action-button">Deposit</button>
            </form>
            <form className="wallet-form" onSubmit={handleWithdraw}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Withdraw (ETH)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
              <button type="submit" className="action-button withdraw">Withdraw</button>
            </form>
            <form className="wallet-form" onSubmit={handleTransfer}>
              <input
                type="text"
                placeholder="Recipient Address"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Transfer (ETH)"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
              />
              <button type="submit" className="action-button transfer">Transfer</button>
            </form>

            {/* WBT Token Alanı */}
            <div className="wallet-balance">
              <span>{wbtSymbol} Token:</span>
              <span className="balance-amount">{wbtBalance} {wbtSymbol}</span>
            </div>
            <form className="wallet-form" onSubmit={handleWbtTransfer}>
              <input
                type="text"
                placeholder="Recipient Address"
                value={wbtTransferTo}
                onChange={(e) => setWbtTransferTo(e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={`Transfer (${wbtSymbol})`}
                value={wbtTransferAmount}
                onChange={(e) => setWbtTransferAmount(e.target.value)}
                required
              />
              <button type="submit" className="action-button transfer">Transfer {wbtSymbol}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default WalletConnect;
