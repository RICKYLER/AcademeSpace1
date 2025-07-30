
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./contexts/ProfileContext";
import { WalletProvider } from "./contexts/WalletProvider";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import StudyGroups from "./pages/StudyGroups";
import Messages from "./pages/Messages";
import Create from "./pages/Create";
import WalletDemo from "./pages/WalletDemo";
import Algebrain from "./pages/Algebrain";
import Bookmarks from "./pages/Bookmarks";
import AIImageGenerator from "./components/AIImageGenerator";
import NotFound from "./pages/NotFound";

const App = () => (
  <WalletProvider>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BookmarkProvider>
      </ProfileProvider>
    </TooltipProvider>
  </WalletProvider>
);

export default App;
