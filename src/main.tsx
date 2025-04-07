
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload the company logo
const logoPreload = document.createElement('link');
logoPreload.rel = 'preload';
logoPreload.href = '/lovable-uploads/6f2775b6-5f8c-4f01-a282-29f1dc0a70da.png';
logoPreload.as = 'image';
document.head.appendChild(logoPreload);

createRoot(document.getElementById("root")!).render(<App />);
