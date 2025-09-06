import React,{useState} from 'react';
import Web3 from 'web3';
import { TRADINGGAME_ADDRESS, TRADINGGAME_ABI, WBT_ADDRESS, WBT_ABI } from './addresses.js';
import './App.css';

// ADRES KONTROLÜ
console.log("Contract Address:", TRADINGGAME_ADDRESS);

function App() {
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [pets, setPets] = useState([]);
  const [wbtBalance, setWbtBalance] = useState(0);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showTasks, setShowTasks] = useState(false);
  const [showMyPets, setShowMyPets] = useState(false);
  const toggleUserPanel = () => {
    setShowUserPanel(!showUserPanel);
  }

  const connectWallet = async () => {
    console.log("Contract Address:", TRADINGGAME_ADDRESS);
    
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
          // Load tasks
          loadTasks(web3);
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
    console.log("Contract Address:", TRADINGGAME_ADDRESS); // BURAYA YAZ
    
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
      console.log('Pets loaded:', petsResult);
      console.log('Pets count:', petsResult.length); // BURAYA EKLE
      setPets(petsResult);
    } catch(error) {
      console.error('Error getting pets:', error);
    }
  }

  const loadTasks = async (web3Instance) => {
    try {
      const contract = new web3Instance.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      
      // Test basic contract connection first
      console.log('Testing contract connection...');
      const owner = await contract.methods.owner().call();
      console.log('Contract owner:', owner);
      
      // Check if tasks array exists and has content
      console.log('Checking tasks array...');
      try {
        const task0 = await contract.methods.tasks(0).call();
        console.log('First task:', task0);
      } catch(e) {
        console.log('No tasks found or tasks array is empty');
        setTasks([]);
        return;
      }
      
      // Try to get tasks count first
      let tasksCount = 0;
      try {
        // Check if there are any tasks by trying to access them
        for(let i = 0; i < 10; i++) {
          const task = await contract.methods.tasks(i).call();
          if(task.id !== undefined) {
            tasksCount = i + 1;
          } else {
            break;
          }
        }
      } catch(e) {
        // No more tasks
      }
      
      console.log('Tasks count:', tasksCount);
      
      // Get each task individually
      const tasksArray = [];
      for(let i = 0; i < tasksCount; i++) {
        const task = await contract.methods.tasks(i).call();
        tasksArray.push(task);
      }
      setTasks(tasksArray);
      console.log('Tasks loaded:', tasksArray);
    } catch(error) {
      console.error('Error loading tasks:', error);
    }
  }

  const completeTask = async (taskId) => {
    try {
      const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      await contract.methods.completeTask(taskId).send({
        from: account,
        gas: 3000000
      });
      alert('Task completed! You earned WBT!');
      // Refresh tasks and balance
      loadTasks(web3);
      // Update balance
      const playerInfo = await contract.methods.playerInfo(account).call();
      setBalance(playerInfo.balance);
    } catch(error) {
      console.error('Error completing task:', error);
      alert('Error completing task!');
    }
  }

  const addDefaultTasks = async () => {
    try {
      const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      await contract.methods.defaultTasks().send({
        from: account,
        gas: 3000000
      });
      alert('Default tasks added successfully!');
      // Refresh tasks
      loadTasks(web3);
    } catch(error) {
      console.error('Error adding default tasks:', error);
      alert('Error adding default tasks!');
    }
  }

  const buyPet = async (petId, price) => {
    try {
      const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      await contract.methods.buyPet(petId).send({
        from: account,
        gas: 3000000
      });
      alert('Pet purchased successfully!');
      // Refresh pets and balance
      getAllPets(web3);
      const playerInfo = await contract.methods.playerInfo(account).call();
      setBalance(playerInfo.balance);
    } catch(error) {
      console.error('Error buying pet:', error);
      alert('Error buying pet!');
    }
  }

  const getMyPets = async () => {
    try {
      const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      const myPets = [];
      
      // Check all pets to see which ones belong to the player
      for(let i = 0; i < pets.length; i++) {
        if(pets[i].owner.toLowerCase() === account.toLowerCase()) {
          myPets.push({...pets[i], index: i});
        }
      }
      
      return myPets;
    } catch(error) {
      console.error('Error getting my pets:', error);
      return [];
    }
  }

  const feedPet = async (petId) => {
    try {
      const contract = new web3.eth.Contract(TRADINGGAME_ABI, TRADINGGAME_ADDRESS);
      await contract.methods.feedPet(petId).send({
        from: account,
        gas: 3000000
      });
      alert('Pet fed successfully!');
      // Refresh pets
      getAllPets(web3);
    } catch(error) {
      console.error('Error feeding pet:', error);
      alert('Error feeding pet!');
    }
  }

  const handlePetClick = (pet) => {
    if(!pet.isForSale) {
      alert('This pet is not for sale!');
      return;
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {isConnected && (
          <div style={{position: 'absolute', top: '20px', right: '20px'}}>
            <button 
              className="user-panel-button" 
              onClick={toggleUserPanel}
              style={{
                padding: '10px 15px',
                backgroundColor: '#fcf75e',
                color: '#644117',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'Arial, Helvetica, sans-serif',
                letterSpacing: '0.2px',
                wordSpacing: '0.6px',
                border: '1px solid #906857',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              User Panel
            </button>
            <button 
              className="tasks-button" 
              onClick={() => setShowTasks(!showTasks)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#fcf75e',
                color: '#644117',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'Arial, Helvetica, sans-serif',
                letterSpacing: '0.2px',
                wordSpacing: '0.6px',
                border: '1px solid #906857',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              📋 Tasks
            </button>
            <button 
              className="my-pets-button" 
              onClick={() => {
                setShowMyPets(!showMyPets);
                if (!showMyPets) {
                  getMyPets(); // My Pets açılırken player pets'lerini yükle
                }
              }}
              style={{
                padding: '10px 15px',
                backgroundColor: '#fcf75e',
                color: '#644117',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'Arial, Helvetica, sans-serif',
                letterSpacing: '0.2px',
                wordSpacing: '0.6px',
                border: '1px solid #906857',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              🐾 My Pets
            </button>
          </div>
        )}
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
                    <div className="pet-card" key={index} onClick={() => handlePetClick(pet)} style={{cursor: 'pointer'}}>
                      <h3 className="pet-name">{pet.name}</h3>
                      <p className="pet-type">Type: <span className="pet-type-value">{pet.types}</span></p>
                      <p className="pet-level">Level: {pet.level}</p>
                      <p className="pet-price">Price: {pet.price} WBT</p>
                      <p className="pet-sale">For Sale: <span className={pet.isForSale ? 'sale-yes' : 'sale-no'}>{pet.isForSale ? 'Yes' : 'No'}</span></p>
                      {pet.isForSale && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            buyPet(index, pet.price);
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#644117',
                            color: '#fcf75e',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            marginTop: '10px'
                          }}
                        >
                          Buy Pet
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        
          </div>
         )}

        {showUserPanel && (
          <div className="user-panel-modal">
            <div className="user-panel-content">
              <h3 style={{color: '#906857', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>User Information</h3>
              <p><strong style={{color: '#906857'}}>Address:</strong> <span style={{color: '#34495e', fontSize: '16px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>{account}</span></p>
              <p><strong style={{color: '#906857'}}>Name:</strong> <span style={{color: '#34495e', fontSize: '16px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>Player</span></p>
              <p><strong style={{color: '#906857'}}>Balance:</strong> <span style={{color: '#34495e', fontSize: '16px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>{balance} WBT</span></p>
              <p><strong style={{color: '#906857'}}>Status:</strong> <span style={{color: '#34495e', fontSize: '16px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>{hasJoined ? 'Active' : 'Not Joined'}</span></p>
              <button onClick={toggleUserPanel}>Close</button>
            </div>
          </div>
        )}

        {showTasks && (
          <div className="tasks-panel-modal">
            <div className="tasks-panel-content">
              <h3 style={{color: '#906857', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>Available Tasks</h3>
              {tasks.length > 0 ? (
                <div className="tasks-list">
                  {tasks.map((task, index) => (
                    <div key={index} className="task-item">
                      <h4 style={{color: '#34495e'}}>{task.name}</h4>
                      <p style={{color: '#666'}}>{task.description}</p>
                      <p style={{color: '#906857', fontWeight: 'bold'}}>Reward: {task.reward} WBT</p>
                      <button 
                        onClick={() => completeTask(index)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Complete Task
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tasks available. Contact owner to add tasks.</p>
              )}
              {isConnected && account.toLowerCase() === '0x106a86e3e563ff5d394ad2c01650157f3d8e56dd' && (
                <button 
                  onClick={addDefaultTasks}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  Add Default Tasks (Owner Only)
                </button>
              )}
              {isConnected && (
                <div style={{marginTop: '15px', fontSize: '12px', color: '#666'}}>
                  Debug: isConnected={isConnected.toString()}, account={account}, owner=0x106A86E3E563fF5D394aD2c01650157F3d8E56DD
                </div>
              )}
              <button onClick={() => setShowTasks(false)}>Close</button>
            </div>
          </div>
        )}

        {showMyPets && (
          <div className="my-pets-modal">
            <div className="my-pets-content">
              <h3 style={{color: '#906857', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.2px', wordSpacing: '0.6px'}}>My Pets</h3>
              <div className="my-pets-list">
                {pets.filter(pet => pet.owner.toLowerCase() === account.toLowerCase()).map((pet, index) => (
                  <div key={index} className="my-pet-item">
                    <h4 style={{color: '#34495e'}}>{pet.name}</h4>
                    <p style={{color: '#666'}}>Type: {pet.types}</p>
                    <p style={{color: '#666'}}>Level: {pet.level}</p>
                    <p style={{color: '#906857', fontWeight: 'bold'}}>Health: {pet.health}</p>
                    <p style={{color: '#906857', fontWeight: 'bold'}}>Hunger: {pet.hunger}</p>
                    <p style={{color: '#906857', fontWeight: 'bold'}}>Happiness: {pet.hapiness}</p>
                    <button 
                      onClick={() => feedPet(pet.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      🍖 Feed Pet
                    </button>
                  </div>
                ))}
              </div>
              {pets.length === 0 && (
                <p>You don't have any pets yet. Buy some pets first!</p>
              )}
              <button onClick={() => setShowMyPets(false)}>Close</button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
