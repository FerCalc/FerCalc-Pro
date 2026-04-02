// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FerCalcPage from './pages/FerCalcPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<FerCalcPage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;