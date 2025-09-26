import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { FF_AUDIO_ENGINE } from './config/features'
import { AudioEngineProvider } from './audio/hooks/useAudioEngine'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    {FF_AUDIO_ENGINE ? (
      <AudioEngineProvider>
        <App />
      </AudioEngineProvider>
    ) : (
      <App />
    )}
  </BrowserRouter>
);