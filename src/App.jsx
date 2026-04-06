// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FerCalcPage from './pages/FerCalcPage';
import AdminApenPage from './pages/AdminApenPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas para usuarios autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<FerCalcPage />} />
        </Route>

        {/* Panel de administración APEN */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminApenPage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
