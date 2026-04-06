// src/pages/ForgotPasswordPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

// ── Esta página está preparada para cuando implementes el envío de email ──
// Por ahora muestra un mensaje claro al usuario indicando cómo recuperar su cuenta.

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-10 text-center">

        <img src={logo} alt="FerCalc Logo" className="h-16 w-auto mx-auto mb-6" />

        <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
          <Mail className="h-7 w-7 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Olvidaste tu contraseña?</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          La recuperación de contraseña por correo electrónico estará disponible próximamente.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 text-left mb-6">
          <p className="font-semibold mb-1">Por el momento podés:</p>
          <ul className="list-disc list-inside space-y-1 text-green-700">
            <li>Intentar con otras contraseñas que uses habitualmente</li>
            <li>Contactar al soporte de FerCalc para que restablezcan tu acceso</li>
          </ul>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-green-600 hover:underline font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
