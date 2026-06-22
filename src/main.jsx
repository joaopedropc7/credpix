import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './Landing.jsx'
import App     from './App.jsx'
import Funnel  from './Funnel.jsx'
import Payment from './Payment.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"                     element={<Landing />} />
        <Route path="/emprestimo"           element={<App />}     />
        <Route path="/emprestimo/simulacao" element={<Funnel />}  />
        <Route path="/pagamento"            element={<Payment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
