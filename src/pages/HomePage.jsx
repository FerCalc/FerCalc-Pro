// src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section className="bg-zinc-800 flex justify-center items-center h-[calc(100vh-100px)]">
      <div className="text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Gestor de Tareas</h1>
        <p className="text-xl text-slate-300 mb-8">
          Organiza tu vida y aumenta tu productividad. Inicia sesión para comenzar.
        </p>
        <Link
          to="/login"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
        >
          ¡Comenzar ahora!
        </Link>
      </div>
    </section>
  );
}

export default HomePage;