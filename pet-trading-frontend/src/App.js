import React,{useState} from 'react';
import logo from './logo.svg';
import Web3 from 'web3';
import './App.css';

function App() {
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);

  const connectWallet = async () => {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        const web3 = new Web3(window.ethereum);
        setAccount(accounts[0]);
        setWeb3(web3);
        setIsConnected(true);
        alert(`Wallet connected! Address: ${accounts[0]}`);

      }catch(error){
        console.error('Error connecting wallet:', error);
        alert('Error connection wallet!');
      }
    }else{
      alert('Please install MetaMask!');
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1> Petrade </h1>
        <button onClick={connectWallet}>
            Connect Metamask!
         </button>
         {isConnected && (
          <div>
            <p>Wallet connected! Address: {account}</p>
            <p>Balance: {balance} WBT</p>
          </div>
         )}
      </header>
    </div>
  );
}

export default App;
