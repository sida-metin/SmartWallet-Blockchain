// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WalletBank {
    address public owner;
    uint public minDeposit;
    uint public maxDeposit;
    uint public fee; 
    uint public constant transferDailyLimit = 15 ether;

    mapping (address => uint256) private balance;
    mapping (address => mapping (address => uint256)) private tokenDeposit; //adrese göre token
    mapping (address => uint256) private dailyTransfer;
    mapping (address => uint256) private lastTransferDay;

    event DepositMade(address indexed reciever, uint amount, uint timestamp);
    event tokenDepositMade(address indexed depositor, address indexed token, uint amount, uint timestamp);
    event TransferMade(address indexed from, address indexed to, uint amount,uint fee, uint timestamp);

    struct Deposit{
        address depositor;
        uint amount;
        uint timestamp;
        string txHash;
    }
    mapping (address => Deposit[]) public depositHistory;

    struct TransferHistory {
        address from;
        address to;
        uint amount;
        uint fee;
        uint timestamp;
    }
    mapping (address => TransferHistory[]) public transferHistory;

    struct Treasury {
        address owner;
        uint amount;
    }
    Treasury public treasury;
    mapping (address => Treasury[]) public treasuries;

    constructor(){
        owner = msg.sender;
        minDeposit = 0.01 ether; 
        maxDeposit = 10 ether; 
        fee = 2; //%2 fee
    }

    modifier onlyOwner(){
        require (msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setFee(uint _fee) public onlyOwner {
        fee = _fee;
    }

    function getBalance(address _user) public view returns (uint) {
        return balance[_user];
    }

    function getTokenDeposit(address _user, address _token) public view returns (uint) {
        return tokenDeposit[_user][_token];
    }

    function getDailyTransfer(address _user) public view returns (uint) { //Kullanıcının günlük transfer miktarı
        return dailyTransfer[_user];
    }

    function getLastTransferDay(address _user) public view returns (uint) { //Hangi gün transfer yaptığı
        return lastTransferDay[_user];
    }

    function deposit() public payable{ // para yatırma işlemi
        require (msg.value >= minDeposit, "Deposit below min limit");
        require ( msg.value<= maxDeposit, "Deposit exceeds max limit");
        balance[msg.sender] += msg.value;

        depositHistory[msg.sender].push(Deposit({
            depositor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            txHash: "0x" // işlem özeti -geçici(placeholder)
        }));

        emit DepositMade(msg.sender, msg.value, block.timestamp);
    }

    function depositToken(address _token, uint _amount) external{
        require(_amount > 0, "Amount must be greater than zero");
        require(_token != address(0), "Invalid token address");

        bool success = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");

        tokenDeposit[msg.sender][_token] += _amount;

        emit tokenDepositMade(msg.sender, _token, _amount, block.timestamp);
        
    }

    modifier dailyTransferLimit(uint _amount) {
        uint today = block.timestamp / 1 days; 
        if(lastTransferDay[msg.sender] != today){
            dailyTransfer[msg.sender] = 0;
            lastTransferDay[msg.sender] = today;
        }
        require(dailyTransfer[msg.sender] + _amount <= transferDailyLimit, "Daily transfer limit exceeded");
        dailyTransfer[msg.sender] += _amount;
        _;
    }

    function transfer(address _to, uint _amount) public dailyTransferLimit(_amount) { // para transferi --payable ödeme aldığında yazılır
        require(balance[msg.sender] >= _amount, "Insufficient balance");
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot transfer to yourself");
        balance[msg.sender] -= _amount;
        uint feeAmount = (_amount * fee) / 100; 
        uint netAmount = _amount - feeAmount;
        payable(_to).transfer(netAmount);
        treasury.amount += feeAmount; 

        transferHistory[msg.sender].push(TransferHistory({
            from: msg.sender,
            to: _to,
            amount: _amount,
            fee: feeAmount,
            timestamp: block.timestamp
        }));

        emit TransferMade(msg.sender,_to,_amount, feeAmount, block.timestamp);
    }

    function withdraw(uint _amount) public { // para çekme işlemi
        require (balance[msg.sender]>= _amount, "Insufficient balance");
        balance[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }
}