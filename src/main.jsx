import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* El basename evita que al hacer clic en un link te mande a tu otra app */}
    <BrowserRouter basename="/OliDe">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
