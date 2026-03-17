// src/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  // 1. Si está cargando, muestra un mensaje.
  // Esto evita que se redirija al login mientras se verifica el token.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-white">Cargando...</h1>
      </div>
    );
  }

  // 2. Si no está cargando Y no está autenticado, redirige al login.
  // 'replace' evita que el usuario pueda volver a la ruta protegida con el botón "atrás" del navegador.
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si pasó las validaciones, muestra el contenido de la ruta protegida.
  // <Outlet /> es el componente que renderiza las rutas hijas (TasksPage, Profile, etc.).
  return <Outlet />;
}

export default ProtectedRoute;