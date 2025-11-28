import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Robustly retrieve createRoot (handles named export or default.createRoot)
const createRoot = ReactDOMClient.createRoot || (ReactDOMClient as any).default?.createRoot;

if (typeof createRoot !== 'function') {
  console.error("ReactDOMClient exports:", ReactDOMClient);
  throw new Error("Failed to find createRoot. Check module imports.");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);