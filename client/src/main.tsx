import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // ← MAKE SURE THIS IS index.css
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)