import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { WalletConnect } from '../components/WalletConnect';
import { useEthereumWallet } from '../hooks/useEthereumWallet';

const WalletDemo: React.FC = () => {
  const { isConnected, account, balance, ensName, connectWallet, disconnectWallet } = useEthereumWallet();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Wallet Connection Demo</h1>
            
            <div className="space-y-6">
              {/* WalletConnect Component */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">RainbowKit Connect Button</h2>
                <WalletConnect />
              </div>

              {/* Connection Status */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-muted border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">How to Use</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Click the wallet icon to open the RainbowKit modal</p>
                  <p>2. Choose your preferred wallet (MetaMask, WalletConnect, etc.)</p>
                  <p>3. Approve the connection in your wallet</p>
                  <p>4. View your account details and balance</p>
                  <p>5. Use "Log out" to remove the connection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default WalletDemo; 