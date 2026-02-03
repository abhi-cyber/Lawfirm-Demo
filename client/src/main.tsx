import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('React mounted successfully');
} catch (error) {
  console.error('React mount error:', error);
  rootElement.innerHTML = `<div style="color:red; padding:20px;"><h1>React Mount Error</h1><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
}
