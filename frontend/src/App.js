import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Wallet, 
  Send, 
  Download, 
  Upload, 
  History, 
  TrendingUp, 
  Shield, 
  Settings,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import './App.css';

// WalletBank ABI - kontratın fonksiyonlarını tanımlar
const WALLET_BANK_ABI = [
  "function deposit() public payable",
  "function withdraw(uint _amount) public",
  "function transfer(address _to, uint _amount) public",
  "function getBalance(address _user) public view returns (uint)",
  "function getDailyTransfer(address _user) public view returns (uint)",
  "function getLastTransferDay(address _user) public view returns (uint)",
  "function depositHistory(address _user, uint _index) public view returns (address depositor, uint amount, uint timestamp, string txHash)",
  "function transferHistory(address _user, uint _index) public view returns (address from, address to, uint amount, uint fee, uint timestamp)",
  "event DepositMade(address indexed reciever, uint amount, uint timestamp)",
  "event TransferMade(address indexed from, address indexed to, uint amount, uint fee, uint timestamp)"
];

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [dailyTransfer, setDailyTransfer] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [contractAddress, setContractAddress] = useState('');

  // MetaMask bağlantısı
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Kontrat adresini buraya ekle (deploy ettikten sonra)
        const contractAddress = '0x...'; // Kontrat adresini buraya yaz
        setContractAddress(contractAddress);
        
        const walletContract = new ethers.Contract(contractAddress, WALLET_BANK_ABI, signer);
        setContract(walletContract);
        
        toast.success('Cüzdan bağlandı!');
        loadWalletData(account, walletContract);
      } else {
        toast.error('MetaMask yüklü değil!');
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      toast.error('Cüzdan bağlantısı başarısız!');
    }
  };

  // Cüzdan verilerini yükle
  const loadWalletData = async (userAccount, walletContract) => {
    try {
      const balance = await walletContract.getBalance(userAccount);
      const dailyTransferAmount = await walletContract.getDailyTransfer(userAccount);
      
      setBalance(ethers.utils.formatEther(balance));
      setDailyTransfer(ethers.utils.formatEther(dailyTransferAmount));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  // Para yatırma
  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      toast.error('Geçerli bir miktar girin!');
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.utils.parseEther(depositAmount);
      const tx = await contract.deposit({ value: amount });
      await tx.wait();
      
      toast.success('Para yatırma başarılı!');
      setDepositAmount('');
      loadWalletData(account, contract);
    } catch (error) {
      console.error('Deposit hatası:', error);
      toast.error('Para yatırma başarısız!');
    } finally {
      setIsLoading(false);
    }
  };

  // Para çekme
  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Geçerli bir miktar girin!');
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.utils.parseEther(withdrawAmount);
      const tx = await contract.withdraw(amount);
      await tx.wait();
      
      toast.success('Para çekme başarılı!');
      setWithdrawAmount('');
      loadWalletData(account, contract);
    } catch (error) {
      console.error('Withdraw hatası:', error);
      toast.error('Para çekme başarısız!');
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer
  const handleTransfer = async () => {
    if (!transferAmount || transferAmount <= 0 || !transferTo) {
      toast.error('Geçerli miktar ve adres girin!');
      return;
    }

    if (!ethers.utils.isAddress(transferTo)) {
      toast.error('Geçerli bir Ethereum adresi girin!');
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.utils.parseEther(transferAmount);
      const tx = await contract.transfer(transferTo, amount);
      await tx.wait();
      
      toast.success('Transfer başarılı!');
      setTransferAmount('');
      setTransferTo('');
      loadWalletData(account, contract);
    } catch (error) {
      console.error('Transfer hatası:', error);
      toast.error('Transfer başarısız!');
    } finally {
      setIsLoading(false);
    }
  };

  // Adres kopyalama
  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success('Adres kopyalandı!');
  };

  // Kısa adres formatı
  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Tab içerikleri
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Bakiye Kartı */}
            <div className="card gradient-bg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Toplam Bakiye</h3>
                  <p className="text-3xl font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
                </div>
                <Wallet className="w-12 h-12" />
              </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Günlük Transfer</p>
                    <p className="text-xl font-semibold">{parseFloat(dailyTransfer).toFixed(4)} ETH</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-success-600" />
                  <div>
                    <p className="text-sm text-gray-600">Güvenlik</p>
                    <p className="text-xl font-semibold">Aktif</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-warning-600" />
                  <div>
                    <p className="text-sm text-gray-600">Son İşlem</p>
                    <p className="text-xl font-semibold">Bugün</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hızlı İşlemler */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <Upload className="w-6 h-6 text-primary-600" />
                  <span className="font-medium">Para Yatır</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('withdraw')}
                  className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-success-300 rounded-lg hover:border-success-500 transition-colors"
                >
                  <Download className="w-6 h-6 text-success-600" />
                  <span className="font-medium">Para Çek</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('transfer')}
                  className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-warning-300 rounded-lg hover:border-warning-500 transition-colors"
                >
                  <Send className="w-6 h-6 text-warning-600" />
                  <span className="font-medium">Transfer</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'deposit':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Para Yatır</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar (ETH)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.01"
                  step="0.01"
                  min="0.01"
                  max="10"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Min: 0.01 ETH, Max: 10 ETH</p>
              </div>
              <button
                onClick={handleDeposit}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'İşleniyor...' : 'Para Yatır'}
              </button>
            </div>
          </div>
        );

      case 'withdraw':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Para Çek</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar (ETH)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.1"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Mevcut bakiye: {balance} ETH</p>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isLoading}
                className="btn-success w-full"
              >
                {isLoading ? 'İşleniyor...' : 'Para Çek'}
              </button>
            </div>
          </div>
        );

      case 'transfer':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Transfer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alıcı Adresi
                </label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar (ETH)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.1"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">%2 işlem ücreti alınır</p>
              </div>
              <button
                onClick={handleTransfer}
                disabled={isLoading}
                className="btn-warning w-full"
              >
                {isLoading ? 'İşleniyor...' : 'Transfer Yap'}
              </button>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">İşlem Geçmişi</h3>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz işlem bulunmuyor</p>
              ) : (
                transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {tx.type === 'deposit' ? (
                        <Upload className="w-5 h-5 text-success-600" />
                      ) : tx.type === 'withdraw' ? (
                        <Download className="w-5 h-5 text-warning-600" />
                      ) : (
                        <Send className="w-5 h-5 text-primary-600" />
                      )}
                      <div>
                        <p className="font-medium">{tx.type === 'deposit' ? 'Para Yatırma' : tx.type === 'withdraw' ? 'Para Çekme' : 'Transfer'}</p>
                        <p className="text-sm text-gray-500">{tx.amount} ETH</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(tx.timestamp * 1000).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.timestamp * 1000).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8" />
              <h1 className="text-xl font-bold">Smart Wallet Bank</h1>
            </div>
            
            {account ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-sm">{shortenAddress(account)}</span>
                  <button onClick={copyAddress} className="hover:text-primary-200">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button className="btn-secondary text-sm">
                  Bağlı
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-secondary">
                Cüzdan Bağla
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {account ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'deposit' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    <span>Para Yatır</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'withdraw' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    <span>Para Çek</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'transfer' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>Transfer</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'history' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <History className="w-5 h-5" />
                    <span>Geçmiş</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Cüzdanınızı Bağlayın
            </h2>
            <p className="text-gray-600 mb-8">
              Smart Wallet Bank'ı kullanmak için MetaMask cüzdanınızı bağlayın
            </p>
            <button onClick={connectWallet} className="btn-primary text-lg px-8 py-3">
              Cüzdan Bağla
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 