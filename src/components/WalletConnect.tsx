import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletConnectProps {
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ className }) => {
  return (
    <div className={className}>
      <ConnectButton />
    </div>
  );
};