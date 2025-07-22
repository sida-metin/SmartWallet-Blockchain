// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WalletBank {
    address public owner;
    uint public minDeposit;
    uint public maxDeposit;

    mapping (address => uint256) public balance;
    mapping (address => mapping (address => uint256)) public tokenDeposit; //adrese göre token

    event DepositMade(address indexed reciever, uint amount, uint timestamp);
    event tokenDepositMade(address indexed depositor, address indexed token, uint amount, uint timestamp);

    struct Deposit{
        address depositor;
        uint amount;
        uint timestamp;
        string txHash;
    }
    mapping (address => Deposit[]) public depositHistory;

    constructor(){
        owner = msg.sender;
        minDeposit = 0.01 ether; 
        maxDeposit = 10 ether; 
    }

    modifier onlyOwner(){
        require (msg.sender == owner, "Only owner can call this function");
        _;
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

    function transfer(address _to, uint _amount) public { // para transferi --payable ödeme aldığında yazılır
        require(balance[msg.sender] >= _amount, "Insufficient balance");
        balance[msg.sender] -= _amount;
        payable(_to).transfer(_amount);
        balance[_to] += _amount;
    }

    function withdraw(uint _amount) public { // para çekme işlemi
        require (balance[msg.sender]>= _amount, "Insufficient balance");
        balance[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }

}