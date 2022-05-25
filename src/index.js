import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Point from './Point';
import GenerateSVG from './GenerateSVG';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Point />
    <GenerateSVG />
  </React.StrictMode>
);