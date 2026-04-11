// src/components/InstallPrompt.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Zap, WifiOff, Monitor, ExternalLink, Smartphone } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('install'); // 'install' | 'open-app' | 'instructions'
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    // Si ya está corriendo como app instalada → no mostrar nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Si el usuario descartó el banner en esta sesión → no mostrar
    if (sessionStorage.getItem('pwa_banner_dismissed') === 'true') return;

    // Capturar el evento de instalación si llega
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true');
      setShow(false);
    });

    // Mostrar el banner después de 3 segundos SIEMPRE
    // (no dependemos del evento del navegador)
    const timer = setTimeout(() => {
      const isInstalled = localStorage.getItem('pwa_installed') === 'true';
      setMode(isInstalled ? 'open-app' : 'install');
      setShow(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    // Si el navegador ofrece instalación automática → usarla
    if (deferredPromptRef.current) {
      setInstalling(true);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 18;
        if (p >= 80) { clearInterval(interval); p = 80; }
        setProgress(Math.min(p, 80));
      }, 120);

      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      clearInterval(interval);

      if (outcome === 'accepted') {
        setProgress(100);
        localStorage.setItem('pwa_installed', 'true');
        setTimeout(() => setShow(false), 1000);
      } else {
        setProgress(0);
        setInstalling(false);
      }
      deferredPromptRef.current = null;
    } else {
      // Sin evento nativo → mostrar instrucciones elegantes
      setMode('instructions');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!show) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  const beneficios = [
    { icon: Zap,        texto: 'Acceso directo desde tu pantalla de inicio' },
    { icon: WifiOff,    texto: 'Sin necesidad de abrir el navegador' },
    { icon: Monitor,    texto: 'Funciona como app nativa en tu dispositivo' },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
        onClick={handleDismiss}
      >
        <div
          className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpPWA 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── HEADER ── */}
          <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
            <button onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
              <X className="h-4 w-4" />
            </button>
            <div className="flex justify-center mb-3">
              <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
            </div>
            {mode === 'open-app' ? (
              <>
                <h2 className="text-xl font-bold text-white">Ya tenés FerCalc instalado</h2>
                <p className="text-green-200 text-xs mt-0.5">Podés abrirlo desde tu {isMobile ? 'pantalla de inicio' : 'escritorio'}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">Instalá FerCalc</h2>
                <p className="text-green-200 text-xs mt-0.5">Calculadora Nutricional · Socios APEN</p>
              </>
            )}
          </div>

          {/* ── CONTENIDO ── */}

          {/* Instalar — beneficios */}
          {mode === 'install' && (
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
          )}

          {/* Instrucciones manuales — elegantes, sin pasos molestos */}
          {mode === 'instructions' && (
            <div className="px-5 py-5">
              <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
                {isIOS ? 'Instalá desde Safari en 2 pasos:' : 'Instalá desde el menú del navegador:'}
              </p>
              {isIOS ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-2xl">⬆️</span>
                    <p className="text-sm text-gray-700">Tocá el botón <strong>Compartir</strong> en la barra de Safari</p>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-2xl">➕</span>
                    <p className="text-sm text-gray-700">Seleccioná <strong>"Agregar a pantalla de inicio"</strong></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-2xl">⋮</span>
                    <p className="text-sm text-gray-700">Tocá el menú de los <strong>tres puntos</strong> del navegador</p>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-2xl">📲</span>
                    <p className="text-sm text-gray-700">Seleccioná <strong>"Instalar app"</strong> o <strong>"Agregar a inicio"</strong></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ya instalada */}
          {mode === 'open-app' && (
            <div className="px-5 py-5">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">FerCalc está en tu dispositivo</p>
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    Buscá el ícono de FerCalc en tu {isMobile ? 'pantalla de inicio' : 'escritorio o barra de tareas'} para abrirlo como app.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barra de progreso */}
          {installing && (
            <div className="px-5 pb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-green-700">{progress < 100 ? 'Instalando...' : '¡Listo!'}</span>
                <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* ── BOTONES ── */}
          <div className="px-5 pb-7 pt-3 space-y-2.5">
            {mode === 'install' && (
              <button onClick={handleInstall} disabled={installing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                {installing ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Instalando...</>
                ) : (
                  <><Download className="h-4 w-4" />Instalar ahora — es gratis</>
                )}
              </button>
            )}

            {mode === 'instructions' && (
              <button onClick={handleDismiss}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                Entendido
              </button>
            )}

            {mode === 'open-app' && (
              <button onClick={handleDismiss}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                Continuar en el navegador
              </button>
            )}

            <button onClick={handleDismiss} className="w-full text-gray-400 hover:text-gray-600 text-sm py-1.5 transition font-medium">
              {mode === 'open-app' ? 'Abrir desde la pantalla de inicio' : 'Ahora no'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpPWA {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
