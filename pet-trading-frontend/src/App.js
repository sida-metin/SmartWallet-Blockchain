import React,{useState} from 'react';
import Web3 from 'web3';
import { TRADINGGAME_ADDRESS, TRADINGGAME_ABI, WBT_ADDRESS, WBT_ABI } from './addresses.js';
import './App.css';

function App() {
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [pets, setPets] = useState([]);
  const [wbtBalance, setWbtBalance] = useState(0);

  const connectWallet = async () => {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        const web3 = new Web3(window.ethereum);
        
        setAccount(accounts[0]);
        setWeb3(web3);
        setIsConnected(true);

        alert(`Wallet connected! Address: ${accounts[0]}`);

        // Check if player has joined and load pets
        const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
        const hasJoinedResult = await contract.methods.hasJoined(accounts[0]).call();
        setHasJoined(hasJoinedResult);

        if (hasJoinedResult) {
          const playerInfo = await contract.methods.playerInfo(accounts[0]).call();
          setBalance(playerInfo.balance);
          
          // Get WBT token balance
          const wbtContract = new web3.eth.Contract(WBT_ABI, WBT_ADDRESS);
          const wbtBalance = await wbtContract.methods.balanceOf(accounts[0]).call();
          setWbtBalance(wbtBalance);
          console.log('WBT Token Balance:', wbtBalance);
          
          // Load pets if already joined
          getAllPets(web3);
        }

      }catch(error){
        console.error('Error connecting wallet:', error);
        alert('Error connection wallet!');
      }
    }else{
      alert('Please install MetaMask!');
    }
  }

  const joinGame = async () => {
    if(!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      
      // Check if already joined
      const hasJoinedResult = await contract.methods.hasJoined(account).call();
      if (hasJoinedResult) {
        alert('You have already joined the game!');
        return;
      }
      
      // Get entry fee and game fee from contract
      const entryFee = await contract.methods.entryFee().call();
      const gameFee = await contract.methods.gameFee().call();
      console.log('Entry Fee:', entryFee);
      console.log('Game Fee:', gameFee);
      
      await contract.methods.joinGame().send({
        from: account,
        value: entryFee,
        gas: 3000000
      });

      alert('Successfully joined the game! You received 10 WBT!');
      
      // Update state after successful join
      setHasJoined(true);
      setBalance(gameFee);
      
    } catch(error) {
      console.error('Error joining game:', error);
      if (error.message.includes('Not enough balance')) {
        alert('Not enough ETH! You need 0.01 ETH to join.');
      } else if (error.message.includes('already joined')) {
        alert('You have already joined the game!');
      } else {
        alert('Error joining game! Check console for details.');
      }
    }
  }

  const getAllPets = async (web3Instance) => {
    try {
      const contract = new web3Instance.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      const petsResult = await contract.methods.getAllPets().call();
      setPets(petsResult);
      console.log('Pets loaded:', petsResult);
    } catch(error) {
      console.error('Error getting pets:', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1> Petrade </h1>
        {!isConnected && (
          <button className="connect-button" onClick={connectWallet}>
            Connect Metamask!
          </button>
        )}
         {isConnected && (
          <div>
            <p>
            <span className="wallet-connected"> Wallet connected! Address: </span>
            <span className="wallet-address">{account}</span>
            </p>
            <p>
              <span className="balance-text">Balance: </span>
              <span className="balance-value">{balance} WBT</span>
            </p>
            {!hasJoined && (
              <button className="join-button" onClick={joinGame} style={{margin: '10px', padding: '10px 20px', fontSize: '16px'}}>
                Join Game
              </button>
            )}

            {pets.length > 0 && (
              <div style={{marginTop: '20px'}}>
                <h3>Pets:</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center'}}>
                  {pets.map((pet, index) => (
                    <div key={index} style={{border: '1px solid #ccc', padding: '10px', borderRadius: '5px', minWidth: '150px'}}>
                      <h4>{pet.name}</h4>
                      <p>Type: {pet.types}</p>
                      <p>Level: {pet.level}</p>
                      <p>Price: {pet.price} WBT</p>
                      <p>For Sale: {pet.isForSale ? 'Yes' : 'No'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        
          </div>
         )}
      </header>
    </div>
  );
}

export default App;
