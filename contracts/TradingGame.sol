// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract TradingGame {
    address public owner;
    uint public entryFee = 0.01 ether;
    uint public gameFee = 10; // 10 WBT
    IERC20 public token;


    event PlayerJoined(address indexed player);
    event PetBought(address indexed player, uint indexed petId);
    event PetSold(address indexed player, uint indexed petId, uint price);
    event PetFed(address indexed player, uint indexed petId);
    event PetCanceledForSale(address indexed player, uint indexed petId);
    event PetForSale(address indexed player, uint indexed petId, uint price);
    event PetLiked(address indexed player, uint indexed petId);
    event TaskCompleted(address indexed player, uint indexed taskId, uint reward);
    event TaskAdded(uint indexed taskId, string name, uint reward);
    event DailyRewardClaimed(address indexed player);
    event AllTasksBonusClaimed(address indexed player);

    constructor (IERC20 _token){
        owner = msg.sender;
        token = _token;

        defaultPets();
        
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Only owner can call this function!");
        _;
    }

    function setFee(uint _fee) public onlyOwner{
        entryFee = _fee;
    }

    struct Player{
        address playerAddress;
        string name;
        uint balance;
        bool isActive;
        uint lastClaimed;
        uint completedTaskCount;
    }
    Player [] public players;
    mapping (address => Player) public playerInfo;
    mapping(address => bool) public hasJoined;

    struct Task {
        uint id;
        string name;
        string description;
        uint reward;
        bool isCompleted;
        TaskType taskType;
    }

    enum TaskType {
        BUY_PET,
        FEED_PET,
        LIKE_PET,
        SELL_PET,
        DAILY_LOGIN
    }
    Task[] public tasks;
    mapping (address => mapping(uint => bool)) public playerTask;
    mapping(address => mapping(uint => bool)) public completedTasks;
    mapping(uint => Task) public tasksById;
    mapping(address => uint) public playerTaskCount;


    struct Pet{
        uint id;
        string name;
        string gender;
        uint level;
        string types;
        uint hunger;
        uint hapiness;
        uint health;
        address owner;
        uint price;
        bool isForSale;
        uint likes;
        uint lastFed; // Added lastFed timestamp
    }
    Pet[] public pets;
    mapping (address => mapping(uint => uint)) public playerPet; // her bir player kaç pete sahip
    mapping (address => uint[]) public playerPetIds; // player hangi petlere sahip

    function defaultPets() public onlyOwner {
        require(pets.length == 0, "Default pets already exist!");
        
        addPet(1, "Cat", "Male", 100, "Legendary", 100, 100, 100, address(0), 100, false, 100000);
        addPet(2, "Doggy", "Female", 50, "Epic", 100, 100, 100, address(0), 90, true, 1000);
        addPet(3, "Fish", "Male", 10, "Common", 100, 100, 100, address(0), 50, true, 10);
        addPet(4, "Rabbit", "Female", 15, "Common", 100, 100, 100, address(0), 55, true, 20);
        addPet(5, "Bird", "Male", 30, "Rare", 100, 100, 100, address(0), 40, true, 50);
        addPet(6, "Guvercin", "Male", 1, "Taklaci", 100, 100, 100, address(0), 1, true, 1);
    }


    function addPet(uint _id, string memory _name, string memory _gender, uint _level,string memory _types ,uint _hunger, uint _hapiness, uint _health, address _owner, uint _price, bool _isForSale, uint _likes) public onlyOwner{
        pets.push(Pet({
            id: _id,
            name: _name,
            gender: _gender,
            level: _level,  
            types: _types,
            hunger: _hunger,
            hapiness: _hapiness,
            health: _health,
            owner: _owner,
            price: _price,
            isForSale: _isForSale,
            likes: _likes,
            lastFed: block.timestamp // Initialize lastFed
        }));
    }

    function getPlayerPetBalance(address _playerAddress, uint _petId) public view returns(uint){
        return playerPet[_playerAddress][_petId];
    }

    function buyPet(uint _petId) public {
        require(pets[_petId].isForSale, "Pet is not for sale!");
        require(playerInfo[msg.sender].balance >= pets[_petId].price, "Not enough balance!");
        require(pets[_petId].owner != msg.sender, "You already own this pet!");
        address seller = pets[_petId].owner;
        playerInfo[msg.sender].balance -= pets[_petId].price;
        playerInfo[seller].balance += pets[_petId].price;
        pets[_petId].owner = msg.sender;
        pets[_petId].isForSale = false;
        playerPet[seller][_petId] = 0; // Eski sahip
        playerPet[msg.sender][_petId] = 1; // Yeni sahip
        removePetFromList(seller, _petId);
        playerPetIds[msg.sender].push(_petId);

        emit PetBought(msg.sender,_petId);
    }

    function sellPet(uint _petId, uint _price) public{
        require(pets[_petId].owner == msg.sender, "You are not the owner of this pet!");
        require(pets[_petId].isForSale, "Pet is not for sale!");
        pets[_petId].isForSale = false;
        pets[_petId].price = _price;
        pets[_petId].owner = msg.sender;

        emit PetSold(msg.sender,_petId,_price);

    }

    function feedPet(uint _petId) public{
        require(pets[_petId].owner == msg.sender, "You are not the owner of this pet!");
        
        // TEST İÇİN: Hunger'ı hızlı azalt (gerçek zamana göre değil)
        uint timePassed = block.timestamp - pets[_petId].lastFed;
        uint hungerDecrease = timePassed / 60; // 60 saniye = 1 hunger azalması (test için hızlı)
        
        if(pets[_petId].hunger > hungerDecrease) {
            pets[_petId].hunger -= hungerDecrease;
        } else {
            pets[_petId].hunger = 0;
        }
        
        require(pets[_petId].hunger < 100, "Pet is full!");

        uint feedCost = pets[_petId].level * 2;

        require(playerInfo[msg.sender].balance >= feedCost, "Not enough balance!");
        playerInfo[msg.sender].balance -= feedCost;
        
        // feeding the pet
        pets[_petId].hunger -= 10;
        pets[_petId].health += 10;
        pets[_petId].hapiness += 10;
        
        // lastFed'i güncelle
        pets[_petId].lastFed = block.timestamp;

        //checking the limits
        if(pets[_petId].hunger < 0){
            pets[_petId].hunger = 0;
        }
        if(pets[_petId].health > 100){
            pets[_petId].health = 100;
        }
        if(pets[_petId].hapiness > 100){
            pets[_petId].hapiness = 100;
        }

        emit PetFed(msg.sender, _petId);
    }

    function petForSale(uint _petId, uint _price) public{
        require(pets[_petId].owner == msg.sender, "You are not the owner of this pet!");
        pets[_petId].isForSale = true;
        pets[_petId].price = _price;

        emit PetForSale(msg.sender, _petId, _price);
    }

    function cancelPetSale(uint _petId) public{
        require(pets[_petId].owner == msg.sender, "You are not the owner of this pet!");
        require(pets[_petId].isForSale, "Pet is not for sale!");
        pets[_petId].isForSale = false;

        emit PetCanceledForSale(msg.sender, _petId);

    }

    function getAllPets() public view returns(Pet[] memory){
        return pets;
    }

    function removePetFromList(address _player, uint _petId) private {
        uint[] storage petList = playerPetIds[_player];
        for(uint i = 0; i < petList.length; i++) {
            if(petList[i] == _petId) {
                petList[i] = petList[petList.length - 1];
                petList.pop();
                break;
            }
        }
    }

    function joinGame() public payable{
        require( msg.value >= entryFee, "Not enough balance!");
        require(!hasJoined[msg.sender], "You already joined the game!");
        Player memory newPlayer = Player({
            playerAddress: msg.sender,
            name: "Player",
            balance: gameFee,
            isActive: true,
            lastClaimed: block.timestamp,
            completedTaskCount: 0
        });
        players.push(newPlayer);
        hasJoined[msg.sender] = true;
        playerInfo[msg.sender] = newPlayer;
        
        // token.transfer(msg.sender, gameFee); // Temporarily disabled

        emit PlayerJoined(msg.sender);
    }

    function likePet(uint _petId) public payable{
        require(pets[_petId].owner != msg.sender, "You can not like your own pet!");
        require(_petId < pets.length, "Pet not found!");
        pets[_petId].likes += 1;

        emit PetLiked(msg.sender, _petId);

    }

    function dailyReward() public {
        require(playerInfo[msg.sender].isActive, "You are not active!");
        require(block.timestamp - playerInfo[msg.sender].lastClaimed >= 1 days, "You have already claimed your daily reward!");
        playerInfo[msg.sender].balance += 10;
        playerInfo[msg.sender].lastClaimed = block.timestamp; 
    
        emit DailyRewardClaimed(msg.sender);

    }

    function defaultTasks() public onlyOwner{
        addTask("Buy Pet", "Buy a pet", 15, TaskType.BUY_PET);
        addTask("Feed Pet", "Feed a pet", 5, TaskType.FEED_PET);
        addTask("Like Pet", "Like a pet", 2, TaskType.LIKE_PET);
        addTask("Sell Pet", "Sell a pet", 15, TaskType.SELL_PET);
        addTask("Daily Login", "Login daily", 10, TaskType.DAILY_LOGIN);
    }

    function addTask(string memory _name, string memory _description, uint _reward, TaskType _taskType) public onlyOwner {
        uint taskId = tasks.length;
        tasks.push(Task({
            id: taskId,
            name: _name,
            description: _description,
            reward: _reward,
            isCompleted: false,
            taskType: _taskType
        }));
        
        emit TaskAdded(taskId, _name, _reward);
    }

    function getCompletedTasks(address _player) public view returns(uint[] memory) {  // memory = geçici hafıza , storage= kalıcı hafıza
        uint[] memory completedTaskIds = new uint[](playerTaskCount[_player]);
        uint index = 0;
        for(uint i = 0; i < tasks.length; i++) {
            if(completedTasks[_player][i]) {
                completedTaskIds[index] = i;
                index++;
            }
        }
        return completedTaskIds;
    }

    function completeTask(uint _taskId) public {
        require(_taskId < tasks.length, "Task does not exist!");
        require(!completedTasks[msg.sender][_taskId], "Task already completed!");
        
        Task storage task = tasks[_taskId];
        playerInfo[msg.sender].balance += task.reward;
        completedTasks[msg.sender][_taskId] = true;
        playerInfo[msg.sender].completedTaskCount += 1;
        
        emit TaskCompleted(msg.sender, _taskId, task.reward);

        if(playerInfo[msg.sender].completedTaskCount == tasks.length) {
            playerInfo[msg.sender].balance += 15; // 15 WBT bonus
            emit AllTasksBonusClaimed(msg.sender);
        }
    }

    function checkAllTasksCompleted(address _player) public view returns(bool) {
        return playerInfo[_player].completedTaskCount == tasks.length;
    }



}