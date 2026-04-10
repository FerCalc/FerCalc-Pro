// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Zap, WifiOff, Monitor } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Si el navegador ya está mostrando la app en modo standalone (instalada),
    // no mostrar el prompt — esta es la detección más confiable
    const isRunningAsApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isRunningAsApp) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar siempre que el navegador ofrezca la instalación
      // y la app no esté corriendo en modo standalone
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShowPrompt(false));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);

    // Animar barra de progreso
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 85) { clearInterval(interval); p = 85; }
      setProgress(Math.min(p, 85));
    }, 150);

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    clearInterval(interval);

    if (outcome === 'accepted') {
      setProgress(100);
      setTimeout(() => setShowPrompt(false), 1000);
    } else {
      setProgress(0);
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => setShowPrompt(false);

  if (!showPrompt) return null;

  const beneficios = [
    { icon: Zap,     texto: 'Acceso directo desde tu pantalla de inicio' },
    { icon: WifiOff, texto: 'Sin necesidad de abrir el navegador' },
    { icon: Monitor, texto: 'Experiencia de app nativa en cualquier dispositivo' },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
        onClick={handleDismiss}
      >
        <div
          className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpInstall 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header verde */}
          <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex justify-center mb-3">
              <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
            </div>
            <h2 className="text-xl font-bold text-white">Instalá FerCalc</h2>
            <p className="text-green-200 text-xs mt-0.5">Calculadora Nutricional · Socios APEN</p>
          </div>

          {/* Beneficios */}
          <div className="px-5 py-4 space-y-3">
            {beneficios.map(({ icon: Icon, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">{texto}</p>
              </div>
            ))}
          </div>

          {/* Barra de progreso — solo durante instalación */}
          {installing && (
            <div className="px-5 pb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-green-700">
                  {progress < 100 ? 'Instalando...' : '¡Listo!'}
                </span>
                <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="px-5 pb-7 pt-4 space-y-2.5">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md"
            >
              {installing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Instalar ahora — es gratis
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition font-medium"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpInstall {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (min-width: 640px) {
          .pwa-card { border-radius: 24px !important; }
        }
      `}</style>
    </>
  );
}
