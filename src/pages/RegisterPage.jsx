// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../pages/fercalc/logo.png';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/app');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await signup({ username, email, password });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[500px]">

        {/* Panel izquierdo — verde FerCalc */}
        <div className="bg-green-600 md:w-1/2 flex flex-col items-center justify-center p-10 text-white text-center">
          <img src={logo} alt="FerCalc Logo" className="h-24 w-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">¡Bienvenido!</h2>
          <p className="text-green-100 mb-8">
            ¿Ya tenés cuenta? Iniciá sesión para acceder a FerCalc.
          </p>
          <Link
            to="/login"
            className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-2 px-8 rounded-xl transition duration-300"
          >
            INICIAR SESIÓN
          </Link>
        </div>

        {/* Panel derecho — formulario */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Crear Cuenta</h2>
          <p className="text-gray-500 text-sm mb-6">Completá el formulario para registrarte</p>

          {registerErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 w-full text-sm">
              {registerErrors.map((error, i) => <p key={i}>{error}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition duration-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Registrando...
                </span>
              ) : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-gray-500 text-sm mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;