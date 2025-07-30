
import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

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
    if (!(window as any).ethereum) {
      setWalletState(prev => ({ ...prev, error: 'Please install MetaMask!' }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      
      const balance = await provider.getBalance(account);
      const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);

      // Try to resolve ENS name
      let ensName = null;
      try {
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
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect wallet',
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

  return {
    ...walletState,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
};
