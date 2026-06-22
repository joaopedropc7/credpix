import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App     from './App.jsx'
import Funnel  from './Funnel.jsx'
import Payment from './Payment.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/emprestimo"           element={<App />}     />
        <Route path="/emprestimo/simulacao" element={<Funnel />}  />
        <Route path="/pagamento"            element={<Payment />} />
        <Route path="*" element={<Navigate to="/emprestimo" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
