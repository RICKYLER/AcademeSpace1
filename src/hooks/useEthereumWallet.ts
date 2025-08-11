
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ethers } from 'ethers';
import safeWalletProvider from '../utils/safeWalletProvider';

interface WalletState {
  account: string | null;
  balance: string | null;
  ensName: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const useEthereumWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    balance: null,
    ensName: null,
    isConnecting: false,
    error: null,
  });

  const isConnected = useMemo(() => !!walletState.account, [walletState.account]);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Use the safe wallet provider
      const accounts = await safeWalletProvider.requestAccounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      
      // Get balance using the safe provider
      const balanceHex = await safeWalletProvider.getBalance(account);
      const balance = ethers.parseUnits(balanceHex, 'wei');
      const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);

      // Try to resolve ENS name
      let ensName = null;
      try {
        // Create a provider for ENS resolution
        const provider = new ethers.BrowserProvider(window.ethereum);
        ensName = await provider.lookupAddress(account);
      } catch (error) {
        // ENS resolution failed, which is fine
        console.log('ENS resolution failed:', error);
      }

      setWalletState({
        account,
        balance: formattedBalance,
        ensName,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: null,
      balance: null,
      ensName: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else {
        // User switched accounts
        setWalletState(prev => ({ ...prev, account: accounts[0] }));
      }
    };

    // Set up event listeners using the safe provider
    safeWalletProvider.setupEventListeners(handleAccountsChanged);

    return () => {
      safeWalletProvider.removeEventListeners(handleAccountsChanged);
    };
  }, [disconnectWallet]);

  return {
    ...walletState,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
};
