import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!

document.body.classList.add('class-retention-mfe__body')
rootElement.classList.add('class-retention-mfe__root')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
