import { useEffect, useState, useCallback } from 'react';
import { SafeWalletProviderManager } from '../utils/safeWalletProvider';

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

  // Safely check for wallet providers using SafeWalletProviderManager
  const detectProviders = useCallback(() => {
    const detectedProviders: WalletProvider[] = [];
    const safeManager = SafeWalletProviderManager.getInstance();
    const availableProviders = safeManager.getAvailableProviders();

    availableProviders.forEach(providerInfo => {
      const walletProvider: WalletProvider = {
        name: providerInfo.name,
        isAvailable: providerInfo.isAvailable,
        connect: async () => {
          try {
            const accounts = await safeManager.requestAccounts();
            return accounts;
          } catch (error) {
            console.error(`${providerInfo.name} connection error:`, error);
            throw error;
          }
        },
        disconnect: () => {
          setAccounts([]);
          setSelectedProvider(null);
          safeManager.removeAccountsChangedListener();
        },
        getAccounts: async () => {
          try {
            return await safeManager.requestAccounts();
          } catch (error) {
            console.error(`Error getting ${providerInfo.name} accounts:`, error);
            return [];
          }
        },
        getBalance: async (address: string) => {
          try {
            const balance = await safeManager.getBalance(address);
            return balance;
          } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
          }
        }
      };
      detectedProviders.push(walletProvider);
    });

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
      
      // Listen for account changes using SafeWalletProviderManager
      const safeManager = SafeWalletProviderManager.getInstance();
      safeManager.setupAccountsChangedListener((newAccounts: string[]) => {
        setAccounts(newAccounts);
      });
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