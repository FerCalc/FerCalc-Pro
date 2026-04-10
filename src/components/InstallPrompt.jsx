// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Zap, WifiOff, Monitor, ExternalLink } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mode, setMode] = useState(null); // null | 'install' | 'open-app'
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // ── Detectar si ya está corriendo como app instalada ──
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    // Si ya están DENTRO de la app instalada, no mostrar nada
    if (isStandalone) return;

    // ── Capturar el evento de instalación si el navegador lo ofrece ──
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setMode(null));

    // ── Mostrar banner después de 2.5s ──
    // Siempre mostramos algo (instalar o abrir app) a menos que estén en standalone
    const timer = setTimeout(() => {
      // Intentar detectar si la app fue instalada previamente
      // Los navegadores modernos disparan beforeinstallprompt SOLO si NO está instalada
      // Si a los 3s no llegó el evento, probablemente ya está instalada
      const wasInstalled = localStorage.getItem('pwa_ever_installed') === 'true';
      if (wasInstalled) {
        setMode('open-app');
      } else {
        setMode('install');
      }
    }, 2500);

    // Si llega el evento, sabemos que NO está instalada
    const handlerWithMode = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      clearTimeout(timer);
      setTimeout(() => setMode('install'), 2500);
    };

    // Reemplazar handler
    window.removeEventListener('beforeinstallprompt', handler);
    window.addEventListener('beforeinstallprompt', handlerWithMode);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handlerWithMode);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Sin evento nativo: mostrar instrucciones manuales según el navegador
      setMode('manual');
      return;
    }
    setInstalling(true);
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
      localStorage.setItem('pwa_ever_installed', 'true');
      setTimeout(() => setMode(null), 1000);
    } else {
      setProgress(0);
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setMode(null);
  };

  if (!mode || dismissed) return null;

  const beneficios = [
    { icon: Zap,     texto: 'Acceso directo desde tu pantalla de inicio' },
    { icon: WifiOff, texto: 'Sin necesidad de abrir el navegador' },
    { icon: Monitor, texto: 'Funciona como app nativa en tu dispositivo' },
  ];

  // ── Detectar navegador para instrucciones manuales ──
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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

          {/* ══ MODO: INSTALAR ══ */}
          {(mode === 'install' || mode === 'manual') && (
            <>
              <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
                <button onClick={handleDismiss}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex justify-center mb-3">
                  <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
                </div>
                <h2 className="text-xl font-bold text-white">Instalá FerCalc</h2>
                <p className="text-green-200 text-xs mt-0.5">Calculadora Nutricional · Socios APEN</p>
              </div>

              {mode === 'manual' ? (
                /* Instrucciones manuales (iOS Safari o sin soporte nativo) */
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {isIOS && isSafari ? 'Para instalar en iPhone/iPad:' : 'Para instalar la app:'}
                  </p>
                  {isIOS && isSafari ? (
                    <ol className="space-y-2.5 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><span className="bg-green-100 text-green-700 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">1</span>Tocá el botón <strong>Compartir</strong> (ícono de cuadro con flecha) en la barra inferior de Safari.</li>
                      <li className="flex items-start gap-2"><span className="bg-green-100 text-green-700 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">2</span>Deslizá hacia abajo y tocá <strong>"Agregar a pantalla de inicio"</strong>.</li>
                      <li className="flex items-start gap-2"><span className="bg-green-100 text-green-700 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">3</span>Tocá <strong>"Agregar"</strong> en la esquina superior derecha.</li>
                    </ol>
                  ) : (
                    <ol className="space-y-2.5 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><span className="bg-green-100 text-green-700 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">1</span>Tocá el menú <strong>⋮</strong> (tres puntos) en la esquina superior derecha del navegador.</li>
                      <li className="flex items-start gap-2"><span className="bg-green-100 text-green-700 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">2</span>Seleccioná <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</li>
                      <li className="flex items-start gap-2"><span className="bg-green-100 text-green-700 font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">3</span>Confirmá tocando <strong>"Instalar"</strong>.</li>
                    </ol>
                  )}
                </div>
              ) : (
                /* Beneficios + botón automático */
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

              <div className="px-5 pb-7 pt-4 space-y-2.5">
                {mode !== 'manual' && (
                  <button onClick={handleInstall} disabled={installing}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                    {installing ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Instalando...</>
                    ) : (
                      <><Download className="h-4 w-4" />Instalar ahora — es gratis</>
                    )}
                  </button>
                )}
                <button onClick={handleDismiss} className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition font-medium">
                  {mode === 'manual' ? 'Cerrar' : 'Ahora no'}
                </button>
              </div>
            </>
          )}

          {/* ══ MODO: ABRIR APP INSTALADA ══ */}
          {mode === 'open-app' && (
            <>
              <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
                <button onClick={handleDismiss}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex justify-center mb-3">
                  <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
                </div>
                <h2 className="text-xl font-bold text-white">Ya tenés FerCalc instalado</h2>
                <p className="text-green-200 text-xs mt-0.5">Podés abrirlo directamente desde tu dispositivo</p>
              </div>

              <div className="px-5 py-5">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">FerCalc está en tu pantalla de inicio</p>
                    <p className="text-xs text-green-600 mt-0.5">Abrilo desde allí para la mejor experiencia</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-7 space-y-2.5">
                <button onClick={handleDismiss}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                  Continuar en el navegador
                </button>
                <p className="text-center text-xs text-gray-400 pb-1">
                  O buscá el ícono de FerCalc en tu pantalla de inicio
                </p>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes slideUpInstall {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
