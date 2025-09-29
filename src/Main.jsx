import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/theory.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);