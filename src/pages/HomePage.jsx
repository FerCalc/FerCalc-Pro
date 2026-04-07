// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../pages/fercalc/logo.png';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[500px]">
        
        {/* Panel izquierdo — verde FerCalc */}
        <div className="bg-green-600 md:w-1/2 flex flex-col items-center justify-center p-10 text-white text-center">
          <img src={logo} alt="FerCalc Logo" className="h-24 w-auto mb-6" />
          <h1 className="text-4xl font-bold mb-2">
            Bienvenido a <span className="text-white">FerCalc</span>
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Calculadora Nutricional
          </p>
          <p className="text-green-100 text-sm mb-8">
            La herramienta profesional para planificación nutricional y dietética.
          </p>
        </div>

        {/* Panel derecho — opciones */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Hola!</h2>
          <p className="text-gray-500 mb-8">
            Ingresá a tu cuenta o creá una nueva para comenzar.
          </p>
          <Link
            to="/login"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition duration-300 mb-4 block"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-xl text-lg transition duration-300 block"
          >
            Crear Cuenta
          </Link>
        </div>

      </div>
    </div>
  );
}

export default HomePage;
