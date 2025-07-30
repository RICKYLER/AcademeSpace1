# Wallet Connection Setup Guide

## Overview
This project now uses RainbowKit and wagmi for a much better wallet connection experience. The new implementation supports:

- Multiple wallet providers (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- ENS name resolution
- Real-time balance updates
- Multi-chain support
- Beautiful, accessible UI
- Better error handling

## Setup Instructions

### 1. Get a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Update the Project ID

Open `src/contexts/WalletProvider.tsx` and replace `'YOUR_PROJECT_ID'` with your actual Project ID:

```typescript
const projectId = 'your-actual-project-id-here';
```

### 3. Test the Connection

1. Start your development server: `npm run dev`
2. Navigate to `/wallet-demo` to test the wallet connection
3. Click "Connect Wallet" to see the RainbowKit modal

## Features

### Supported Wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- Argent
- Trust Wallet
- Ledger
- And many more!

### Supported Chains
- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Base
- Zora
- Goerli (development)
- Sepolia (development)

## Usage

### Basic Usage
```typescript
import { useEthereumWallet } from '../hooks/useEthereumWallet';

const MyComponent = () => {
  const { isConnected, account, balance, connectWallet, disconnectWallet } = useEthereumWallet();
  
  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <p>Balance: {balance} ETH</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
    </div>
  );
};
```

### Using the ConnectButton Component
```typescript
import { WalletConnect } from '../components/WalletConnect';

const MyComponent = () => {
  return (
    <div>
      <WalletConnect />
    </div>
  );
};
```

## Customization

### Theme Customization
You can customize the RainbowKit theme in `src/contexts/WalletProvider.tsx`:

```typescript
<RainbowKitProvider
  chains={chains}
  theme={{
    accentColor: '#6366f1',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  }}
>
```

### Chain Configuration
Add or remove chains in the `configureChains` call in `src/contexts/WalletProvider.tsx`.

## Troubleshooting

### Common Issues

1. **"Project ID not found" error**: Make sure you've set the correct Project ID in the WalletProvider
2. **Wallet not connecting**: Ensure you have a wallet extension installed (MetaMask, etc.)
3. **Balance not showing**: Check if you're on the correct network in your wallet

### Development vs Production
- Test networks (Goerli, Sepolia) are only included in development mode
- Make sure to test on mainnet before deploying to production

## Migration from Old Implementation

The new implementation is a drop-in replacement for your old `useEthereumWallet` hook. The interface remains the same, but now provides:

- Better error handling
- Support for more wallets
- ENS name resolution
- Real-time balance updates
- Better UI/UX

No changes to your existing components are required! 