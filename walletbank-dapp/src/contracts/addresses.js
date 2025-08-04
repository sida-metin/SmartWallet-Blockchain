
export const WALLETBANK_ADDRESS = "0xfDECBF7A106bF58ba0fcde24dbcA6Be78D63F48B";
export const WALLETBANK_ABI = [
  { "inputs": [], "stateMutability": "payable", "type": "function", "name": "deposit", "outputs": [] },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferEth", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

export const WBT_ADDRESS = "0x48f80C93fbA5AF9880Fdb5e08466bde4d4d98874";
export const WBT_ABI = [
  { "constant": true, "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function", "stateMutability": "view" },
  { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function", "stateMutability": "view" },
  { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function", "stateMutability": "view" },
  { "constant": false, "inputs": [{ "name": "to", "type": "address" }, { "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "type": "function", "stateMutability": "nonpayable" }
];
