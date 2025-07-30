import React from 'react';
import { Wallet } from 'lucide-react';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { Button } from './ui/button';

interface WalletConnectProps {
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ className }) => {
  const {
    isConnected,
    account,
    ensName,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useEthereumWallet();

  return (
    <div className={className}>
      {!isConnected ? (
        <Button
          variant="default"
          size="icon"
          onClick={connectWallet}
          disabled={isConnecting}
          aria-label="Connect Wallet"
        >
          <Wallet className="w-6 h-6" />
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-mono text-xs text-green-700 dark:text-green-300">
            {ensName || `${account?.slice(0, 6)}...${account?.slice(-4)}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            aria-label="Disconnect Wallet"
            className="text-red-600 hover:text-red-700 dark:text-red-400 px-2 py-1 text-xs"
          >
            Log out
          </Button>
        </div>
      )}
    </div>
  );
};