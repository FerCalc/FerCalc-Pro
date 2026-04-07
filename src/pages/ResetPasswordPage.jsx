// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

const API = import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña.');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay token en la URL
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Enlace inválido</h2>
          <p className="text-gray-500 text-sm mb-6">Este enlace de recuperación no es válido o ya fue utilizado.</p>
          <Link to="/forgot-password" className="text-green-600 hover:underline font-semibold text-sm">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">

        <div className="text-center mb-8">
          <img src={logo} alt="FerCalc Logo" className="h-14 w-auto mx-auto mb-4" />
          <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
            <Lock className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Nueva contraseña</h2>
          <p className="text-gray-500 text-sm mt-2">Elegí una contraseña segura para tu cuenta.</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¡Contraseña restablecida!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition text-center"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 text-gray-800 pl-10 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repetí la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Restableciendo...
                  </span>
                ) : 'Restablecer contraseña'}
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

export default ResetPasswordPage;
