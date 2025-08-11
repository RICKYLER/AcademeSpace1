// Safe Wallet Provider - Provides safe access to wallet providers without conflicts

interface SafeWalletProvider {
  name: string;
  isAvailable: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
}

class SafeWalletProviderManager {
  private static instance: SafeWalletProviderManager;
  private providers: Map<string, SafeWalletProvider> = new Map();
  private activeProvider: string | null = null;

  private constructor() {
    this.detectProviders();
  }

  public static getInstance(): SafeWalletProviderManager {
    if (!SafeWalletProviderManager.instance) {
      SafeWalletProviderManager.instance = new SafeWalletProviderManager();
    }
    return SafeWalletProviderManager.instance;
  }

  private detectProviders() {
    // MetaMask - check if it exists and is accessible
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Test if we can access the ethereum object
        const testProvider = window.ethereum;
        if (testProvider && typeof testProvider.request === 'function') {
          this.providers.set('metamask', {
            name: 'MetaMask',
            isAvailable: true,
            request: testProvider.request.bind(testProvider),
            on: testProvider.on.bind(testProvider),
            removeListener: testProvider.removeListener.bind(testProvider)
          });
          console.log('✅ MetaMask detected and available');
        }
      } catch (error) {
        console.log('⚠️ MetaMask detected but not accessible:', error);
      }
    }

    // Coinbase Wallet
    if (typeof window !== 'undefined' && (window as any).coinbaseWalletExtension) {
      try {
        const coinbaseProvider = (window as any).coinbaseWalletExtension;
        if (coinbaseProvider && typeof coinbaseProvider.request === 'function') {
          this.providers.set('coinbase', {
            name: 'Coinbase Wallet',
            isAvailable: true,
            request: coinbaseProvider.request.bind(coinbaseProvider),
            on: coinbaseProvider.on.bind(coinbaseProvider),
            removeListener: coinbaseProvider.removeListener.bind(coinbaseProvider)
          });
          console.log('✅ Coinbase Wallet detected and available');
        }
      } catch (error) {
        console.log('⚠️ Coinbase Wallet detected but not accessible:', error);
      }
    }

    // Log available providers
    const availableProviders = Array.from(this.providers.values()).filter(p => p.isAvailable);
    if (availableProviders.length > 0) {
      console.log('📱 Available wallet providers:', availableProviders.map(p => p.name));
    } else {
      console.log('⚠️ No wallet providers detected');
    }
  }

  public getAvailableProviders(): SafeWalletProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.isAvailable);
  }

  public getActiveProvider(): SafeWalletProvider | null {
    if (!this.activeProvider) return null;
    return this.providers.get(this.activeProvider) || null;
  }

  public setActiveProvider(providerName: string): boolean {
    if (this.providers.has(providerName)) {
      this.activeProvider = providerName;
      console.log(`✅ Active wallet provider set to: ${providerName}`);
      return true;
    }
    console.log(`❌ Wallet provider not found: ${providerName}`);
    return false;
  }

  public async requestAccounts(): Promise<string[]> {
    const provider = this.getActiveProvider();
    
    if (!provider) {
      // Try to use the first available provider
      const availableProviders = this.getAvailableProviders();
      if (availableProviders.length > 0) {
        this.activeProvider = Array.from(this.providers.keys()).find(
          key => this.providers.get(key) === availableProviders[0]
        ) || null;
        return this.requestAccounts();
      }
      throw new Error('No wallet provider available');
    }

    try {
      console.log(`🔗 Requesting accounts from ${provider.name}...`);
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });
      console.log(`✅ Connected to ${provider.name} with accounts:`, accounts);
      return accounts;
    } catch (error) {
      console.error(`❌ Error requesting accounts from ${provider.name}:`, error);
      throw error;
    }
  }

  public async getAccounts(): Promise<string[]> {
    const provider = this.getActiveProvider();
    
    if (!provider) {
      return [];
    }

    try {
      const accounts = await provider.request({
        method: 'eth_accounts'
      });
      return accounts;
    } catch (error) {
      console.error(`❌ Error getting accounts from ${provider.name}:`, error);
      return [];
    }
  }

  public async getBalance(address: string): Promise<string> {
    const provider = this.getActiveProvider();
    
    if (!provider) {
      return '0';
    }

    try {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      return balance;
    } catch (error) {
      console.error(`❌ Error getting balance from ${provider.name}:`, error);
      return '0';
    }
  }

  public setupEventListeners(
    onAccountsChanged: (accounts: string[]) => void,
    onChainChanged?: (chainId: string) => void
  ) {
    const provider = this.getActiveProvider();
    
    if (!provider) return;

    try {
      provider.on('accountsChanged', onAccountsChanged);
      if (onChainChanged) {
        provider.on('chainChanged', onChainChanged);
      }
      console.log(`✅ Event listeners set up for ${provider.name}`);
    } catch (error) {
      console.error(`❌ Error setting up event listeners for ${provider.name}:`, error);
    }
  }

  public removeEventListeners(
    onAccountsChanged: (accounts: string[]) => void,
    onChainChanged?: (chainId: string) => void
  ) {
    const provider = this.getActiveProvider();
    
    if (!provider) return;

    try {
      provider.removeListener('accountsChanged', onAccountsChanged);
      if (onChainChanged) {
        provider.removeListener('chainChanged', onChainChanged);
      }
      console.log(`✅ Event listeners removed for ${provider.name}`);
    } catch (error) {
      console.error(`❌ Error removing event listeners for ${provider.name}:`, error);
    }
  }

  public getProviderInfo() {
    const activeProvider = this.getActiveProvider();
    const availableProviders = this.getAvailableProviders();
    
    return {
      activeProvider: activeProvider?.name || 'None',
      availableProviders: availableProviders.map(p => p.name),
      totalProviders: availableProviders.length
    };
  }
}

// Create and export the singleton instance
export const safeWalletProvider = SafeWalletProviderManager.getInstance();

// Auto-initialize when the script loads
if (typeof window !== 'undefined') {
  // Small delay to ensure wallet extensions have loaded
  setTimeout(() => {
    safeWalletProvider.detectProviders();
  }, 100);
}

export default safeWalletProvider; 