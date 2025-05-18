import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId='323618382899-nhlfvi1jtd81cmk7eue8alifjbg3frio.apps.googleusercontent.com'>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
