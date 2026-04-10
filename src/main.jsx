// mi-app-frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import { FerCalcProvider } from './context/FerCalcContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <FerCalcProvider>
            <App />
          </FerCalcProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);