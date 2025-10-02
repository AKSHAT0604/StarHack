import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { PointsProvider } from './contexts/PointsContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PointsProvider>
        <App />
      </PointsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
