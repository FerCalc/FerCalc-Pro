// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../pages/fercalc/logo.png';
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[560px]">

        {/* Panel izquierdo — verde FerCalc */}
        <div className="bg-green-600 md:w-1/2 flex flex-col items-center justify-center p-10 text-white text-center">
          <img src={logo} alt="FerCalc Logo" className="h-24 w-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">¡Bienvenido!</h2>
          <p className="text-green-100 mb-5">
            ¿Ya tenés cuenta? Iniciá sesión para acceder a FerCalc.
          </p>

          <div className="bg-green-700 rounded-2xl p-4 mb-6 text-left text-sm border border-green-500 w-full">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span className="font-semibold text-white">Acceso exclusivo para socios APEN</span>
            </div>
            <p className="text-green-100 leading-relaxed">
              FerCalc es un beneficio exclusivo para socios activos de la{' '}
              <strong className="text-white">Asociación Paraguaya de Estudiantes de Nutrición</strong>.
              Usá el correo electrónico con el que estás registrado en la APEN.
            </p>
          </div>

          <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-2 px-8 rounded-xl transition duration-300">
            INICIAR SESIÓN
          </Link>
        </div>

        {/* Panel derecho — formulario */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Crear Cuenta</h2>
          <p className="text-gray-500 text-sm mb-6">Usá tu correo registrado en la APEN</p>

          {registerErrors && registerErrors.length > 0 && (
            <div className="w-full mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>{registerErrors.map((e, i) => <p key={i} className="text-sm text-red-700 font-medium">{e}</p>)}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 text-gray-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" placeholder="Correo electrónico (el de la APEN)" value={email} onChange={(e) => setEmail(e.target.value)}
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

            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition duration-300">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Verificando...
                </span>
              ) : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-gray-500 text-sm mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
