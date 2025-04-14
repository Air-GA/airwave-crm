
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload the company logo
const logoPreload = document.createElement('link');
logoPreload.rel = 'preload';
logoPreload.href = '/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png';
logoPreload.as = 'image';
document.head.appendChild(logoPreload);

createRoot(document.getElementById("root")!).render(<App />);
