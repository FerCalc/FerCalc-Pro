// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../pages/fercalc/logo.png';
import { AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signin, isAuthenticated, errors: loginErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/app');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await signin({ email, password });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[500px]">

        {/* Panel izquierdo — formulario */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Acceso</h2>
          <p className="text-gray-500 text-sm mb-6">Ingresá tus datos para continuar</p>

          {loginErrors && loginErrors.length > 0 && (
            <div className="w-full mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>{loginErrors.map((e, i) => <p key={i} className="text-sm text-red-700 font-medium">{e}</p>)}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 text-gray-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 text-gray-800 pl-10 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition duration-300">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Conectando...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-gray-500 text-sm mt-6">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">Registrate</Link>
          </p>
        </div>

        {/* Panel derecho — verde FerCalc */}
        <div className="bg-green-600 md:w-1/2 flex flex-col items-center justify-center p-10 text-white text-center">
          <img src={logo} alt="FerCalc Logo" className="h-24 w-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">¡Bienvenido de vuelta!</h2>
          <p className="text-green-100 mb-8">
            Ingresá tus datos personales para acceder a todas las funciones de FerCalc.
          </p>
          <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-2 px-8 rounded-xl transition duration-300">
            REGISTRARSE
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
