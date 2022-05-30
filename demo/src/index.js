import React from 'react';
import ReactDOM from 'react-dom/client';
import CallKit, { join } from '../../src/index'
import WebIM from './webim'
import App from './demo'

const root = ReactDOM.createRoot(
  document.getElementById('demo')
);


root.render(<App />)

