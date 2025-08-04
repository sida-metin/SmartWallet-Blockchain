


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
  // Bakiye güncelleme fonksiyonu
  const getBalances = async () => {
    if (!window.ethereum || !account) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      let newWbtBalance = 0;
      let newBalance = 0;
      
      // WBT
      const wbtContract = new Contract(WBT_ADDRESS, WBT_ABI, provider);
      try {
        const decimals = await wbtContract.decimals();
        setWbtDecimals(Number(decimals));
        const symbol = await wbtContract.symbol();
        setWbtSymbol(symbol);
        const wbtBal = await wbtContract.balanceOf(account);
        newWbtBalance = Number(formatUnits(wbtBal, Number(decimals)));
        setWbtBalance(newWbtBalance);
      } catch (e) {
        console.error("WBT Error:", e);
        setWbtDecimals(8);
        setWbtSymbol("WBT");
        setWbtBalance(0);
      }
      
      // ETH (MetaMask'taki bakiye)
      const ethBal = await provider.getBalance(account);
      newBalance = Number(formatUnits(ethBal, 18));
      setBalance(newBalance);
      
      // localStorage'a kaydet
      localStorage.setItem('wbtBalance', newWbtBalance.toString());
      localStorage.setItem('ethBalance', newBalance.toString());
      localStorage.setItem('account', account);
      
    } catch (e) {
      console.error('Balance yükleme hatası:', e);
      setWbtBalance(0);
      setBalance(0);
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan balance'ları yükle
    const savedAccount = localStorage.getItem('account');
    const savedWbtBalance = localStorage.getItem('wbtBalance');
    const savedEthBalance = localStorage.getItem('ethBalance');
    
    if (savedAccount && savedWbtBalance && savedEthBalance) {
      setAccount(savedAccount);
      setWbtBalance(parseFloat(savedWbtBalance));
      setBalance(parseFloat(savedEthBalance));
    }
  }, []);

  useEffect(() => {
    if (window.ethereum && account) {
      getBalances();
      
      // Her 10 saniyede bir balance güncelle
      const interval = setInterval(getBalances, 10000);
      
      // Account değişikliğini dinle
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem('account', accounts[0]);
        } else {
          setAccount("");
          localStorage.removeItem('account');
          localStorage.removeItem('wbtBalance');
          localStorage.removeItem('ethBalance');
        }
      };

      // Chain değişikliğini dinle
      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        clearInterval(interval);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
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
      await getBalances();
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
      await getBalances();
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
      await getBalances();
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
              <span>Balance:</span>
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
