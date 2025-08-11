import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
// Import safe wallet provider to handle wallet extensions safely
import './utils/safeWalletProvider'

createRoot(document.getElementById("root")!).render(<App />);
