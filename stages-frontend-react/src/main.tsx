import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

(window as Window & typeof globalThis & { global: Window }).global = window;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);