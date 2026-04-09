// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Zap, WifiOff, Bell } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Capturar el evento nativo antes de que el navegador lo muestre
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Mostrar solo si el usuario no lo descartó antes
      const dismissed = localStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        // Esperar 3 segundos para no interrumpir la carga
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);

    // Pequeña animación antes de lanzar el prompt nativo
    await new Promise(r => setTimeout(r, 800));

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstalled(true);
      setShowPrompt(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  const beneficios = [
    { icon: Zap,     texto: 'Acceso instantáneo desde tu pantalla de inicio' },
    { icon: WifiOff, texto: 'Funciona sin necesidad de abrir el navegador' },
    { icon: Monitor, texto: 'Experiencia de app nativa en cualquier dispositivo' },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleDismiss}>

        {/* Card */}
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Header verde */}
          <div className="bg-green-600 px-6 pt-8 pb-6 text-center relative">
            <button onClick={handleDismiss}
              className="absolute top-4 right-4 text-green-200 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={logo} alt="FerCalc" className="h-20 w-20 rounded-2xl shadow-lg border-2 border-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-white">Instalá FerCalc</h2>
            <p className="text-green-100 text-sm mt-1">Calculadora Nutricional — APEN</p>
          </div>

          {/* Beneficios */}
          <div className="px-6 py-5 space-y-3">
            {beneficios.map(({ icon: Icon, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">{texto}</p>
              </div>
            ))}
          </div>

          {/* Barra de progreso (solo durante instalación) */}
          {installing && (
            <div className="px-6 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-green-700">Instalando...</span>
                <span className="text-xs text-gray-400">Por favor esperá</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full animate-pulse"
                  style={{ width: '75%', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="px-6 pb-6 pt-3 space-y-3">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              {installing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Instalar ahora
                </>
              )}
            </button>

            <button onClick={handleDismiss}
              className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium py-2 transition">
              Ahora no
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  );
}
