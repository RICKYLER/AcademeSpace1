import { useEffect, useState, useCallback } from 'react';

interface WalletProvider {
  name: string;
  isAvailable: boolean;
  connect: () => Promise<string[]>;
  disconnect: () => void;
  getAccounts: () => Promise<string[]>;
  getBalance: (address: string) => Promise<string>;
}

export const useWalletProvider = () => {
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<WalletProvider | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safely check for wallet providers
  const detectProviders = useCallback(() => {
    const detectedProviders: WalletProvider[] = [];

    // Check for MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const metamaskProvider: WalletProvider = {
        name: 'MetaMask',
        isAvailable: true,
        connect: async () => {
          try {
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts'
            });
            return accounts;
          } catch (error) {
            console.error('MetaMask connection error:', error);
            throw error;
          }
        },
        disconnect: () => {
          setAccounts([]);
          setSelectedProvider(null);
        },
        getAccounts: async () => {
          try {
            return await window.ethereum.request({
              method: 'eth_accounts'
            });
          } catch (error) {
            console.error('Error getting MetaMask accounts:', error);
            return [];
          }
        },
        getBalance: async (address: string) => {
          try {
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            return balance;
          } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
          }
        }
      };
      detectedProviders.push(metamaskProvider);
    }

    // Check for other wallet providers (Coinbase Wallet, etc.)
    if (typeof window !== 'undefined' && (window as any).coinbaseWalletExtension) {
      const coinbaseProvider: WalletProvider = {
        name: 'Coinbase Wallet',
        isAvailable: true,
        connect: async () => {
          try {
            const accounts = await (window as any).coinbaseWalletExtension.request({
              method: 'eth_requestAccounts'
            });
            return accounts;
          } catch (error) {
            console.error('Coinbase Wallet connection error:', error);
            throw error;
          }
        },
        disconnect: () => {
          setAccounts([]);
          setSelectedProvider(null);
        },
        getAccounts: async () => {
          try {
            return await (window as any).coinbaseWalletExtension.request({
              method: 'eth_accounts'
            });
          } catch (error) {
            console.error('Error getting Coinbase accounts:', error);
            return [];
          }
        },
        getBalance: async (address: string) => {
          try {
            const balance = await (window as any).coinbaseWalletExtension.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            return balance;
          } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
          }
        }
      };
      detectedProviders.push(coinbaseProvider);
    }

    setProviders(detectedProviders);
  }, []);

  // Connect to a specific provider
  const connectWallet = useCallback(async (provider: WalletProvider) => {
    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await provider.connect();
      setAccounts(accounts);
      setSelectedProvider(provider);
      
      // Listen for account changes
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          setAccounts(newAccounts);
        });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    if (selectedProvider) {
      selectedProvider.disconnect();
    }
  }, [selectedProvider]);

  // Get account balance
  const getBalance = useCallback(async (address: string) => {
    if (selectedProvider) {
      return await selectedProvider.getBalance(address);
    }
    return '0';
  }, [selectedProvider]);

  // Initialize providers on mount
  useEffect(() => {
    detectProviders();
  }, [detectProviders]);

  return {
    providers,
    selectedProvider,
    accounts,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getBalance,
    detectProviders
  };
};

export default useWalletProvider; 