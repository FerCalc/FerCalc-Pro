// src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos nuestro contexto de autenticación

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-zinc-700 my-3 flex justify-between py-5 px-10 rounded-lg text-white">
      <Link to={isAuthenticated ? "/tasks" : "/"}>
        <h1 className="text-2xl font-bold">Gestor de Tareas</h1>
      </Link>
      <ul className="flex items-center gap-x-4">
        {isAuthenticated ? (
          // --- VISTA PARA USUARIOS AUTENTICADOS ---
          <>
            <li>
              <span className="font-semibold">Bienvenido, {user.username}!</span>
            </li>
            <li>
              <Link to="/add-task" className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md">
                Añadir Tarea
              </Link>
            </li>
            <li>
              <Link
                to="/"
                onClick={() => {
                  logout();
                }}
                className="text-slate-300 hover:text-white"
              >
                Cerrar Sesión
              </Link>
            </li>
          </>
        ) : (
          // --- VISTA PARA INVITADOS ---
          <>
            <li>
              <Link to="/login" className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md">
                Iniciar Sesión
              </Link>
            </li>
            <li>
              <Link to="/register" className="bg-zinc-800 hover:bg-zinc-600 px-4 py-2 rounded-md">
                Registrarse
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;