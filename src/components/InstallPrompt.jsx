// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Zap, WifiOff, Monitor, ExternalLink } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);         // banner de instalar
  const [showOpenApp, setShowOpenApp] = useState(false); // banner de abrir app
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Si ya está corriendo como app instalada → no mostrar nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Escuchar si el navegador ofrece instalación
    // Este evento SOLO llega si la app NO está instalada aún
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 2500);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Si la app ya estaba instalada, el evento NO llega
    // Esperamos 4s: si no llegó el evento = ya está instalada → mostrar "Abrir app"
    const timeoutId = setTimeout(() => {
      // Solo mostramos "abrir app" si el usuario alguna vez instaló (guardamos ese flag al instalar)
      if (localStorage.getItem('pwa_installed') === 'true') {
        setShowOpenApp(true);
      }
      // Si no hay flag y no llegó el evento: no mostramos nada
      // (puede ser Firefox, navegador sin soporte PWA, etc.)
    }, 4000);

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true');
      setShow(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);

    // Animar barra de progreso
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 80) { clearInterval(interval); p = 80; }
      setProgress(Math.min(p, 80));
    }, 120);

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    clearInterval(interval);

    if (outcome === 'accepted') {
      setProgress(100);
      localStorage.setItem('pwa_installed', 'true');
      setTimeout(() => setShow(false), 1000);
    } else {
      setProgress(0);
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  const beneficios = [
    { icon: Zap,     texto: 'Acceso directo desde tu pantalla de inicio' },
    { icon: WifiOff, texto: 'Sin necesidad de abrir el navegador' },
    { icon: Monitor, texto: 'Funciona como app nativa en tu dispositivo' },
  ];

  // ── Banner instalar ──
  if (show) return (
    <Overlay onClose={() => setShow(false)}>
      <Header onClose={() => setShow(false)} title="Instalá FerCalc" subtitle="Calculadora Nutricional · Socios APEN" />

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

      {installing && <ProgressBar progress={progress} />}

      <div className="px-5 pb-7 pt-3 space-y-2.5">
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
            <><Download className="h-4 w-4" /> Instalar ahora — es gratis</>
          )}
        </button>
        <button onClick={() => setShow(false)} className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition font-medium">
          Ahora no
        </button>
      </div>
    </Overlay>
  );

  // ── Banner abrir app instalada ──
  if (showOpenApp) return (
    <Overlay onClose={() => setShowOpenApp(false)}>
      <Header onClose={() => setShowOpenApp(false)} title="Ya tenés FerCalc instalado" subtitle="Abrilo desde tu pantalla de inicio para la mejor experiencia" />

      <div className="px-5 py-5">
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ExternalLink className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">FerCalc está en tu dispositivo</p>
            <p className="text-xs text-green-600 mt-1 leading-relaxed">
              Buscá el ícono de FerCalc en tu pantalla de inicio o escritorio para abrirlo como app y tener la mejor experiencia.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-7 space-y-2.5">
        <button
          onClick={() => setShowOpenApp(false)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md"
        >
          Entendido, continuar aquí
        </button>
        <p className="text-center text-xs text-gray-400">
          También podés buscar el ícono de FerCalc en tu {/android|iphone|ipad/i.test(navigator.userAgent) ? 'pantalla de inicio' : 'escritorio o barra de tareas'}
        </p>
      </div>
    </Overlay>
  );

  return null;
}

// ── Componentes auxiliares ──
function Overlay({ children, onClose }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpInstall 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
          onClick={e => e.stopPropagation()}
        >
          {children}
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

function Header({ onClose, title, subtitle }) {
  return (
    <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex justify-center mb-3">
        <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-green-200 text-xs mt-0.5">{subtitle}</p>
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
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
  );
}
