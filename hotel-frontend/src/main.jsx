import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'

const eventLogger = (event, error) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens) => {
  console.log('onKeycloakTokens', tokens)
}

const LoadingComponent = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600">Initializing authentication...</p>
    <p className="text-sm text-gray-500 mt-2">If this takes too long, Keycloak might not be running.</p>
    <p className="text-sm text-gray-500">Check: http://localhost:8180</p>
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
      initOptions={{
        onLoad: 'check-sso',
        checkLoginIframe: false,
        timeoutInSeconds: 10
      }}
      LoadingComponent={<LoadingComponent />}
    >
      <App />
    </ReactKeycloakProvider>
  </StrictMode>,
)
