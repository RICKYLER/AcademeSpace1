import React, { useState, useEffect } from 'react';
import safeWalletProvider from '../utils/safeWalletProvider';
import { addRealtimeMessage, listenToRealtimeMessages } from '../lib/firebase-realtime';

const WalletTest: React.FC = () => {
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get provider info on mount
    setProviderInfo(safeWalletProvider.getProviderInfo());
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await safeWalletProvider.requestAccounts();
      setAccounts(accounts);
      console.log('✅ Wallet connected successfully:', accounts);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      console.error('❌ Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccounts([]);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Wallet Test</h2>
      
      {/* Provider Info */}
      {providerInfo && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Provider Information:</h3>
          <div className="text-sm space-y-1">
            <div>Active Provider: {providerInfo.activeProvider}</div>
            <div>Available Providers: {providerInfo.availableProviders.join(', ') || 'None'}</div>
            <div>Total Providers: {providerInfo.totalProviders}</div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${accounts.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm">
            {accounts.length > 0 ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {accounts.length > 0 && (
          <div className="text-sm text-gray-600">
            Connected Account: {accounts[0]}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {accounts.length === 0 ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect Wallet
          </button>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
        <h4 className="font-semibold mb-1">Debug Info:</h4>
        <div>Window Ethereum: {typeof window !== 'undefined' && window.ethereum ? 'Available' : 'Not Available'}</div>
        <div>Coinbase Extension: {typeof window !== 'undefined' && (window as any).coinbaseWalletExtension ? 'Available' : 'Not Available'}</div>
        <div>Accounts Count: {accounts.length}</div>
        <div>Is Connecting: {isConnecting.toString()}</div>
      </div>
    </div>
  );
};

export default WalletTest; 