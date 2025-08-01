import { useState } from "react";

function WalletConnect() {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      alert("MetaMask not found. Please install it.");
    }
  };

  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">WalletBank dApp</h1>
      <div>
        {account ? (
          <span className="bg-green-600 px-3 py-1 rounded">{account.slice(0, 6)}...{account.slice(-4)}</span>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default WalletConnect;
