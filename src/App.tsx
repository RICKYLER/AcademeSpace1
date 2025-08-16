
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./contexts/ProfileContext";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// RainbowKit imports
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  sepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import Index from "./pages/Index";
import Profile from "./pages/Profile";
import StudyGroups from "./pages/StudyGroups";
import Messages from "./pages/Messages";
import Create from "./pages/Create";
import WalletDemo from "./pages/WalletDemo";
import Algebrain from "./pages/Algebrain";
import Bookmarks from "./pages/Bookmarks";
import AIImageGenerator from "./components/AIImageGenerator";
import FirebaseChatDemo from "./components/FirebaseChatDemo";
import FirebaseRealtimeDemo from "./components/FirebaseRealtimeDemo";
import RealtimeMessageSystem from "./components/RealtimeMessageSystem";
import WalletTest from "./components/WalletTest";
import FirebaseMessageTest from "./components/FirebaseMessageTest";
import NotFound from "./pages/NotFound";

// Configure RainbowKit (removed Base chain)
const config = getDefaultConfig({
  appName: 'AcademeSpace - AI Learning Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id', // Get this from WalletConnect Cloud
  chains: [
    {
      ...mainnet,
      iconBackground: '#627EEA',
      iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      ...polygon,
      iconBackground: '#8247E5',
      iconUrl: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    },
    {
      ...optimism,
      iconBackground: '#FF0420',
      iconUrl: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    },
    {
      ...arbitrum,
      iconBackground: '#28A0F0',
      iconUrl: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    },
    {
      ...sepolia,
      iconBackground: '#FFC700',
      iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
  ],
  ssr: false, // Since this is a client-side React app
});

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider 
        theme={darkTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          borderRadius: 'medium',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
        initialChain={mainnet}
      >
        <ThemeProvider>
          <TooltipProvider>
            <ProfileProvider>
              <BookmarkProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/study-groups" element={<StudyGroups />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/wallet-demo" element={<WalletDemo />} />
                    <Route path="/algebrain" element={<Algebrain />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/ai-image-generator" element={<AIImageGenerator />} />
                    <Route path="/firebase-chat-demo" element={<FirebaseChatDemo />} />
                    <Route path="/firebase-realtime-demo" element={<FirebaseRealtimeDemo />} />
                    <Route path="/realtime-messages" element={<RealtimeMessageSystem />} />
                    <Route path="/wallet-test" element={<WalletTest />} />
                    <Route path="/firebase-message-test" element={<FirebaseMessageTest />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </BookmarkProvider>
            </ProfileProvider>
          </TooltipProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
