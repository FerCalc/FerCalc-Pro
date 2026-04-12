// src/components/InstallPrompt.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, ArrowDownToLine, ChevronRight } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [show, setShow]           = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [done, setDone]           = useState(false);
  const deferredPromptRef         = useRef(null);

  // Detectar si ya está instalada (modo standalone = corriendo como app)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    if (isStandalone) return; // ya está instalada y abierta como app → no mostrar nada

    // Capturar evento automático de Chrome si llega
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShow(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone) return null; // si está como app instalada, no renderizar

  const handleInstallClick = async () => {
    // Si Chrome ofrece instalación automática → usarla con barra de progreso
    if (deferredPromptRef.current) {
      setInstalling(true);
      setProgress(0);

      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15 + 5;
        if (p >= 85) { clearInterval(interval); p = 85; }
        setProgress(Math.round(p));
      }, 150);

      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      deferredPromptRef.current = null;
      clearInterval(interval);

      if (outcome === 'accepted') {
        setProgress(100);
        setTimeout(() => { setDone(true); setInstalling(false); }, 800);
      } else {
        setInstalling(false);
        setProgress(0);
      }
      return;
    }

    // Si no hay evento automático → mostrar instrucciones
    setShow(true);
  };

  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS     = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isMobile  = isAndroid || isIOS;

  // Instrucciones según dispositivo
  const instrucciones = isIOS ? [
    { emoji: '1️⃣', texto: <>Tocá el botón <strong>Compartir</strong> <span className="text-lg">⬆</span> en la barra inferior de Safari</> },
    { emoji: '2️⃣', texto: <>Deslizá hacia abajo y tocá <strong>"Agregar a pantalla de inicio"</strong></> },
    { emoji: '3️⃣', texto: <>Tocá <strong>"Agregar"</strong> en la esquina superior derecha</> },
  ] : isAndroid ? [
    { emoji: '1️⃣', texto: <>Tocá el menú <strong>⋮</strong> (tres puntos) en la esquina superior derecha de Chrome</> },
    { emoji: '2️⃣', texto: <>Tocá <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla de inicio"</strong></> },
    { emoji: '3️⃣', texto: <>Confirmá tocando <strong>"Instalar"</strong> o <strong>"Agregar"</strong></> },
  ] : [
    { emoji: '1️⃣', texto: <>Buscá el ícono <strong>⊕</strong> al final de la barra de direcciones de Chrome o Edge</> },
    { emoji: '2️⃣', texto: <>Hacé clic en <strong>"Instalar FerCalc"</strong></> },
    { emoji: '3️⃣', texto: <>Confirmá haciendo clic en <strong>"Instalar"</strong></> },
  ];

  return (
    <>
      {/* ── Botón fijo discreto ── */}
      {!done && !show && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{ animation: 'fadeInBtn 0.5s ease 1.5s both' }}
        >
          <ArrowDownToLine className="h-4 w-4" />
          <span className="hidden sm:inline">Instalar app</span>
        </button>
      )}

      {/* ── Barra de progreso de instalación automática ── */}
      {installing && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-green-500 px-6 py-4 shadow-2xl">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-green-700">Instalando FerCalc...</span>
              <span className="text-sm font-semibold text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-200 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mensaje de éxito ── */}
      {done && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-green-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg">
          <Smartphone className="h-4 w-4" />
          <span>¡FerCalc instalado!</span>
        </div>
      )}

      {/* ── Panel de instrucciones ── */}
      {show && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpPWA 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
              <button onClick={() => setShow(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
                <X className="h-4 w-4" />
              </button>
              <div className="flex justify-center mb-3">
                <img src={logo} alt="FerCalc" className="h-14 w-14 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
              </div>
              <h2 className="text-lg font-bold text-white">Instalá FerCalc en tu dispositivo</h2>
              <p className="text-green-200 text-xs mt-0.5">
                {isMobile ? 'Seguí estos pasos en tu celular:' : 'Seguí estos pasos en tu computadora:'}
              </p>
            </div>

            {/* Instrucciones */}
            <div className="px-5 py-5 space-y-3">
              {instrucciones.map(({ emoji, texto }, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xl flex-shrink-0">{emoji}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{texto}</p>
                </div>
              ))}

              {isAndroid && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 text-center">
                    💡 Si no ves "Instalar app", buscá <strong>"Agregar a pantalla de inicio"</strong> en el mismo menú
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 pb-6">
              <button onClick={() => setShow(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUpPWA {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInBtn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}
