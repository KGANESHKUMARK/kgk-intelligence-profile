import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { validateRegistry } from './learning/services/registry';
import './styles/index.css';

// Development-time knowledge-graph validation: fails loudly in the console
// if any topic/question/visual cross-reference points at content that
// doesn't exist. Never runs in production builds.
if (import.meta.env.DEV) {
  validateRegistry();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
