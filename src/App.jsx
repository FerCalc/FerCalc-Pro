// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FerCalcPage from './pages/FerCalcPage';
import AdminApenPage from './pages/AdminApenPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';

function App() {
  return (
    <main>
      {/* Prompt de instalación PWA — aparece globalmente */}
      <InstallPrompt />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<FerCalcPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminApenPage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
