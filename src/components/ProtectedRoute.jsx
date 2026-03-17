// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    // 1. Si estamos cargando, mostramos un mensaje
    if (loading) {
        return <h1 className="text-white text-2xl text-center mt-10">Cargando...</h1>;
    }

    // 2. Si no estamos cargando Y no estamos autenticados, redirigimos al login
    if (!loading && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si pasamos las validaciones, mostramos el contenido de la ruta
    return <Outlet />;
}

export default ProtectedRoute;