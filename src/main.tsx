import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext'
import { LicenseProvider } from './context/LicenseContext'
import LicenseGate from './components/LicenseGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LicenseProvider>
      <LicenseGate>
        <AppProvider>
          <App />
        </AppProvider>
      </LicenseGate>
    </LicenseProvider>
  </StrictMode>,
)
