// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

const API = import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al enviar el correo.');

      setSent(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el correo. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-10">

        <div className="text-center mb-8">
          <img src={logo} alt="FerCalc Logo" className="h-14 w-auto mx-auto mb-4" />
          <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
            <Mail className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-500 text-sm mt-2">
            Ingresá tu correo y te enviamos un enlace para restablecerla.
          </p>
        </div>

        {/* Estado: enviado con éxito */}
        {sent ? (
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¡Correo enviado!</h3>
            <p className="text-gray-500 text-sm mb-2">
              Si <strong>{email}</strong> está registrado en FerCalc, vas a recibir un enlace en los próximos minutos.
            </p>
            <p className="text-gray-400 text-xs mb-6">
              Revisá también tu carpeta de spam por si acaso.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-green-600 hover:underline font-semibold text-sm">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="mb-4 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 text-gray-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

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
                    Enviando...
                  </span>
                ) : 'Enviar enlace de recuperación'}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-green-600 hover:underline font-semibold text-sm">
                <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
